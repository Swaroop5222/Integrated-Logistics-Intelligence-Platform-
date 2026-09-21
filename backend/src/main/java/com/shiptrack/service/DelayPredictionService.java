package com.shiptrack.service;

import com.shiptrack.dto.DelayPredictionRequest;
import com.shiptrack.dto.DelayPredictionResponse;
import com.shiptrack.dto.GeoPoint;
import com.shiptrack.dto.ShipmentLocationResponse;
import com.shiptrack.entity.DelayPrediction;
import com.shiptrack.entity.Route;
import com.shiptrack.entity.Shipment;
import com.shiptrack.enums.DelayRiskLevel;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.enums.TrafficCondition;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.DelayPredictionRepository;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class DelayPredictionService {

   
    private static final double AT_RISK_THRESHOLD_MINUTES = 30.0;

    private static final double DELAYED_THRESHOLD_MINUTES = 60.0;

    private final ShipmentRepository shipmentRepository;

    private final RouteRepository routeRepository;

    private final LiveTrackingService liveTrackingService;

    private final MapsService mapsService;
    private final DelayPredictionRepository delayPredictionRepository;
    

    public DelayPredictionService(
            ShipmentRepository shipmentRepository,
            RouteRepository routeRepository,
            LiveTrackingService liveTrackingService,
            MapsService mapsService,
            DelayPredictionRepository delayPredictionRepository) {

        this.shipmentRepository =
                shipmentRepository;

        this.routeRepository =
                routeRepository;

        this.liveTrackingService =
                liveTrackingService;

        this.mapsService =
                mapsService;

        this.delayPredictionRepository = delayPredictionRepository;
    }

    @Transactional(readOnly = true)
    public DelayPredictionResponse predict(
            Long shipmentId,
            DelayPredictionRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Delay prediction request is required");
        }

       
        if (request.getWeatherDelayHours() < 0
                || request.getRouteChangeDelayHours() < 0) {

            throw new IllegalArgumentException(
                    "Delay values cannot be negative");
        }

        Shipment shipment =
                shipmentRepository.findById(shipmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Shipment not found with ID: "
                                                + shipmentId));

        DelayPredictionResponse response =
                new DelayPredictionResponse();

        response.setShipmentId(
                shipment.getId());

        response.setTrackingNumber(
                shipment.getTrackingNumber());

        response.setCurrentStatus(
                shipment.getStatus());

        
        if (shipment.getStatus()
                == ShipmentStatus.DELIVERED) {

            response.setRiskLevel(
                    DelayRiskLevel.DELIVERED);

            response.setPredictedDeliveryTime(
                    LocalDateTime.now());

            response.setTotalPredictedDelayMinutes(0);

            response.setReason(
                    "Shipment has already been delivered.");

            return response;
        }

        
        if (shipment.getStatus()
                == ShipmentStatus.CANCELLED) {

            response.setRiskLevel(
                    DelayRiskLevel.INSUFFICIENT_DATA);

            response.setReason(
                    "Delay prediction is not applicable "
                            + "to a cancelled shipment.");

            return response;
        }

       
        Route route =
                routeRepository
                        .findByShipmentId(shipmentId)
                        .orElse(null);

        
        GeoPoint destination =
                request.getDestination();

        if (destination == null
                && route != null
                && route.getDestinationLatitude() != null
                && route.getDestinationLongitude() != null) {

            destination =
                    new GeoPoint(
                            route.getDestinationLatitude(),
                            route.getDestinationLongitude());
        }

        if (destination == null) {

            response.setRiskLevel(
                    DelayRiskLevel.INSUFFICIENT_DATA);

            response.setReason(
                    "Destination coordinates are not available.");

            return response;
        }

        
        ShipmentLocationResponse currentLocation;

        try {

            currentLocation =
                    liveTrackingService
                            .getCurrentLocation(shipmentId);

        } catch (Exception exception) {

            response.setRiskLevel(
                    DelayRiskLevel.INSUFFICIENT_DATA);

            response.setReason(
                    "Current shipment location is not available.");

            return response;
        }

        if (currentLocation == null
                || currentLocation.getLatitude() == null
                || currentLocation.getLongitude() == null) {

            response.setRiskLevel(
                    DelayRiskLevel.INSUFFICIENT_DATA);

            response.setReason(
                    "Current shipment location is not available.");

            return response;
        }

        MapsService.Coordinates origin =
                new MapsService.Coordinates(
                        currentLocation.getLatitude(),
                        currentLocation.getLongitude());

        MapsService.Coordinates destinationCoordinates =
                new MapsService.Coordinates(
                        destination.getLatitude(),
                        destination.getLongitude());

        
        MapsService.RouteData routeData;

        try {

            routeData =
                    mapsService.route(
                            origin,
                            destinationCoordinates);

        } catch (Exception exception) {

            response.setRiskLevel(
                    DelayRiskLevel.INSUFFICIENT_DATA);

            response.setReason(
                    "Unable to calculate the remaining route.");

            return response;
        }

        
        double baseRouteMinutes =
                routeData.durationSeconds() / 60.0;

        
        double distanceKm =
                routeData.distanceMeters() / 1000.0;

        
        TrafficCondition traffic =
                request.getTrafficCondition();

        if (traffic == null) {

            traffic =
                    TrafficCondition.MODERATE;
        }

        
        double trafficDelayMinutes =
                baseRouteMinutes
                        * (traffic.getMultiplier() - 1.0);

        
        double weatherDelayMinutes =
                request.getWeatherDelayHours() * 60.0;

        
        double routeChangeDelayMinutes =
                request.getRouteChangeDelayHours() * 60.0;

       
        double totalPredictedDelayMinutes =
                trafficDelayMinutes
                        + weatherDelayMinutes
                        + routeChangeDelayMinutes;

        
        double totalPredictedTravelMinutes =
                baseRouteMinutes
                        + totalPredictedDelayMinutes;

        LocalDateTime predictedDeliveryTime =
                LocalDateTime.now()
                        .plusSeconds(
                                Math.round(
                                        totalPredictedTravelMinutes
                                                * 60.0));

        
        DelayRiskLevel riskLevel;

        if (totalPredictedDelayMinutes
                >= DELAYED_THRESHOLD_MINUTES) {

            riskLevel =
                    DelayRiskLevel.DELAYED;

        } else if (totalPredictedDelayMinutes
                >= AT_RISK_THRESHOLD_MINUTES) {

            riskLevel =
                    DelayRiskLevel.AT_RISK;

        } else {

            riskLevel =
                    DelayRiskLevel.ON_TIME;
        }

        
        String reason =
                buildReason(
                        traffic,
                        trafficDelayMinutes,
                        weatherDelayMinutes,
                        routeChangeDelayMinutes,
                        riskLevel);

       

        DelayPrediction prediction = new DelayPrediction();

        prediction.setShipment(shipment);
        prediction.setDistanceKm(distanceKm);
        prediction.setBaseRouteMinutes(baseRouteMinutes);
        prediction.setTrafficDelayMinutes(trafficDelayMinutes);
        prediction.setWeatherDelayMinutes(weatherDelayMinutes);
        prediction.setRouteChangeDelayMinutes(routeChangeDelayMinutes);
        prediction.setTotalPredictedDelayMinutes(totalPredictedDelayMinutes);
        prediction.setTotalPredictedTravelMinutes(totalPredictedTravelMinutes);
        prediction.setPredictedDeliveryTime(predictedDeliveryTime);
        prediction.setRiskLevel(riskLevel);
        prediction.setTrafficCondition(traffic);
        prediction.setReason(reason);

delayPredictionRepository.save(prediction);
        response.setDistanceKm(
                distanceKm);

        response.setBaseRouteMinutes(
                baseRouteMinutes);

        response.setTrafficDelayMinutes(
                trafficDelayMinutes);

        response.setWeatherDelayMinutes(
                weatherDelayMinutes);

        response.setRouteChangeDelayMinutes(
                routeChangeDelayMinutes);

        response.setTotalPredictedDelayMinutes(
                totalPredictedDelayMinutes);

        response.setTotalPredictedTravelMinutes(
                totalPredictedTravelMinutes);

        response.setPredictedDeliveryTime(
                predictedDeliveryTime);

        response.setRiskLevel(
                riskLevel);

        response.setTrafficCondition(
                traffic);

        response.setReason(reason);

        return response;
    }

    private String buildReason(
            TrafficCondition traffic,
            double trafficDelayMinutes,
            double weatherDelayMinutes,
            double routeChangeDelayMinutes,
            DelayRiskLevel riskLevel) {

        StringBuilder reason =
                new StringBuilder();

        switch (riskLevel) {

            case DELAYED:

                reason.append(
                        "Shipment has a high predicted delay.");

                break;

            case AT_RISK:

                reason.append(
                        "Shipment is at risk of delay.");

                break;

            case ON_TIME:

                reason.append(
                        "Shipment is currently predicted "
                                + "to remain on schedule.");

                break;

            default:

                reason.append(
                        "Delay prediction determined "
                                + "from available route data.");
        }

        reason.append(
                " Traffic condition: ")
                .append(traffic)
                .append(".");

        if (trafficDelayMinutes > 0) {

            reason.append(
                    " Traffic contributes approximately ")
                    .append(
                            Math.round(
                                    trafficDelayMinutes))
                    .append(" minutes.");
        }

        if (weatherDelayMinutes > 0) {

            reason.append(
                    " Existing weather-delay input "
                            + "contributes approximately ")
                    .append(
                            Math.round(
                                    weatherDelayMinutes))
                    .append(" minutes.");
        }

        if (routeChangeDelayMinutes > 0) {

            reason.append(
                    " Route changes contribute approximately ")
                    .append(
                            Math.round(
                                    routeChangeDelayMinutes))
                    .append(" minutes.");
        }

        return reason.toString();
    }

    
}
