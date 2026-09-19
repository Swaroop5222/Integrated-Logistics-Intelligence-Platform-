package com.shiptrack.service;

import com.shiptrack.entity.Forecast;
import com.shiptrack.entity.Route;
import com.shiptrack.entity.Shipment;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ForecastRepository;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ForecastService {

    private final ShipmentRepository shipmentRepository;
    private final RouteRepository routeRepository;
    private final ForecastRepository forecastRepository;

    public ForecastService(
            ShipmentRepository shipmentRepository,
            RouteRepository routeRepository,
            ForecastRepository forecastRepository) {
        this.shipmentRepository = shipmentRepository;
        this.routeRepository = routeRepository;
        this.forecastRepository = forecastRepository;
    }

    @Transactional
    public Forecast generateForecast(Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shipment not found with ID: " + shipmentId));

        Route route = routeRepository.findByShipmentId(shipmentId)
                .orElse(null);

        LocalDateTime predictedDeliveryTime;
        double confidence;

        /*
         * If a route exists with an estimated duration,
         * use that duration to calculate the forecast.
         */
        if (route != null
                && route.getEstimatedDurationMinutes() != null
                && route.getEstimatedDurationMinutes() > 0) {

            predictedDeliveryTime = LocalDateTime.now()
                    .plusMinutes(route.getEstimatedDurationMinutes());

            confidence = 0.75;

        } else {

            /*
             * Fallback when no route information is available.
             */
            predictedDeliveryTime = LocalDateTime.now()
                    .plusDays(1);

            confidence = 0.40;
        }

        /*
         * Adjust forecast according to current shipment status.
         */
        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {

            predictedDeliveryTime = LocalDateTime.now();
            confidence = 0.99;

        } else if (shipment.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY) {

            predictedDeliveryTime = LocalDateTime.now()
                    .plusHours(4);

            confidence = Math.max(confidence, 0.70);
        }

        Forecast forecast = new Forecast();

        forecast.setShipment(shipment);
        forecast.setPredictedDeliveryTime(predictedDeliveryTime);
        forecast.setConfidence(
                Math.max(0.0, Math.min(1.0, confidence))
        );
        forecast.setPredictedStatus(shipment.getStatus());

        return forecastRepository.save(forecast);
    }

    public List<Forecast> getForecastsForShipment(Long shipmentId) {

        return forecastRepository
                .findByShipmentIdOrderByCreatedAtDesc(shipmentId);
    }

    public List<Forecast> listAll() {

        return forecastRepository.findAll();
    }
}