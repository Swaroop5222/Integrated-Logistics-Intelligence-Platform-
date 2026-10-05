package com.shiptrack.service;

import com.shiptrack.dto.DeliveryEtaRequest;
import com.shiptrack.dto.DeliveryEtaResponse;
import com.shiptrack.dto.GeoPoint;
import com.shiptrack.dto.ShipmentLocationResponse;
import com.shiptrack.entity.Route;
import com.shiptrack.entity.Shipment;
import com.shiptrack.enums.TrafficCondition;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class DeliveryEtaService {

    private static final double ALERT_THRESHOLD_HOURS = 0.5;

    private final ShipmentRepository shipmentRepository;
    private final LiveTrackingService liveTrackingService;
    private final MapsService mapsService;
    private final RouteRepository routeRepository;
    private final ShipmentService shipmentService;

    public DeliveryEtaService(
            ShipmentRepository shipmentRepository,
            LiveTrackingService liveTrackingService,
            MapsService mapsService,
            RouteRepository routeRepository,
            ShipmentService shipmentService) {

        this.shipmentRepository = shipmentRepository;
        this.liveTrackingService = liveTrackingService;
        this.mapsService = mapsService;
        this.routeRepository = routeRepository;
        this.shipmentService = shipmentService;
    }

    @Transactional
    public DeliveryEtaResponse calculate(
            Long shipmentId,
            DeliveryEtaRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("ETA request is required");
        }

        if (request.getWeatherDelayHours() < 0
                || request.getRouteChangeDelayHours() < 0) {

            throw new IllegalArgumentException(
                    "Delay values cannot be negative");
        }

        shipmentService.getShipmentById(shipmentId);
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shipment not found with ID: " + shipmentId));

        Route route = routeRepository
                .findByShipmentId(shipmentId)
                .orElse(null);

        GeoPoint destination = request.getDestination();

        if (destination == null
                && route != null
                && route.getDestinationLatitude() != null
                && route.getDestinationLongitude() != null) {

            destination = new GeoPoint(
                    route.getDestinationLatitude(),
                    route.getDestinationLongitude());
        }

        if (destination == null) {
            throw new IllegalArgumentException(
                    "Destination coordinates are required when no saved route coordinates exist");
        }

        /*
         * Reuse existing Live Delivery Tracking.
         * The latest recorded location becomes the ETA origin.
         */
        ShipmentLocationResponse current =
                liveTrackingService.getCurrentLocation(shipmentId);

        Double originLatitude = current != null
                ? current.getLatitude()
                : route == null ? null : route.getOriginLatitude();
        Double originLongitude = current != null
                ? current.getLongitude()
                : route == null ? null : route.getOriginLongitude();

        if (originLatitude == null || originLongitude == null) {
            throw new IllegalArgumentException(
                    "A live location or saved route origin coordinates are required to calculate ETA");
        }

        MapsService.Coordinates origin =
                new MapsService.Coordinates(
                        originLatitude,
                        originLongitude);

        MapsService.Coordinates destinationCoordinates =
                new MapsService.Coordinates(
                        destination.getLatitude(),
                        destination.getLongitude());

        /*
         * Reuse existing OSM/OSRM MapsService.
         */
        MapsService.RouteData estimate =
                mapsService.route(origin, destinationCoordinates);

        TrafficCondition traffic =
                request.getTrafficCondition() == null
                        ? TrafficCondition.MODERATE
                        : request.getTrafficCondition();

        double routeMinutes =
                estimate.durationSeconds() / 60.0;

        double trafficDelay =
                routeMinutes * (traffic.getMultiplier() - 1);

        double weatherDelay =
                request.getWeatherDelayHours() * 60;

        double routeChangeDelay =
                request.getRouteChangeDelayHours() * 60;

        double predictedDelay =
                trafficDelay
                        + weatherDelay
                        + routeChangeDelay;

        DeliveryEtaResponse response =
                new DeliveryEtaResponse();

        response.setShipmentId(shipment.getId());

        response.setTrackingNumber(
                shipment.getTrackingNumber());

        response.setDistanceKm(
                estimate.distanceMeters() / 1000.0);

        response.setRouteHours(
                routeMinutes / 60.0);

        response.setTrafficDelayHours(
                trafficDelay / 60.0);

        response.setWeatherDelayHours(
                request.getWeatherDelayHours());

        response.setRouteChangeDelayHours(
                request.getRouteChangeDelayHours());

        response.setPredictedDelayHours(
                predictedDelay / 60.0);

        response.setExpectedCompletionTime(
                LocalDateTime.now()
                        .plusSeconds(
                                Math.round(
                                        (routeMinutes + predictedDelay)
                                                * 60)));

        response.setTrafficCondition(traffic);

        response.setDelayAlert(
                predictedDelay / 60.0
                        > ALERT_THRESHOLD_HOURS);

        return response;
    }
}