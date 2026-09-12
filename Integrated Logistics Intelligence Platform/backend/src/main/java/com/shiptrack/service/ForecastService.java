package com.shiptrack.service;

import com.shiptrack.model.*;
import com.shiptrack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ForecastService {
    private final DeliveryRepository deliveryRepository;
    private final ShipmentRepository shipmentRepository;
    private final RouteRepository routeRepository;
    private final ForecastRepository forecastRepository;

    public ForecastService(DeliveryRepository deliveryRepository,
                           ShipmentRepository shipmentRepository,
                           RouteRepository routeRepository,
                           ForecastRepository forecastRepository) {
        this.deliveryRepository = deliveryRepository;
        this.shipmentRepository = shipmentRepository;
        this.routeRepository = routeRepository;
        this.forecastRepository = forecastRepository;
    }

    @Transactional
    public Forecast generateForecast(Long deliveryId) {
        Delivery d = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        Shipment shipment = shipmentRepository.findByDeliveryId(deliveryId).orElse(null);

        Route route = null;
        if (shipment != null && shipment.getRoute() != null) route = shipment.getRoute();
        else if (d.getOrigin() != null && d.getDestination() != null) {
            route = routeRepository.findByOriginAndDestination(d.getOrigin(), d.getDestination()).orElse(null);
        }

        LocalDateTime predicted;
        double confidence = 0.5; // base confidence

        if (d.getEstimatedDelivery() != null) {
            predicted = d.getEstimatedDelivery();
            confidence = 0.75;
        } else if (route != null && route.getDistanceKm() > 0) {
            double speed = route.getAverageSpeedKmh() > 0 ? route.getAverageSpeedKmh() : 50.0;
            double hours = route.getDistanceKm() / speed;
            predicted = LocalDateTime.now().plus(Duration.ofMinutes((long) (hours * 60)));
            confidence = 0.6 + Math.min(0.3, 0.3 * (route.getDistanceKm() / 500.0));
        } else {
            // fallback: use now + 24 hours
            predicted = LocalDateTime.now().plusDays(1);
            confidence = 0.4;
        }

        // adjust by status
        if (d.getStatus() == DeliveryStatus.DELIVERED) {
            predicted = LocalDateTime.now();
            confidence = 0.99;
        } else if (d.getStatus() == DeliveryStatus.OUT_FOR_DELIVERY) {
            predicted = LocalDateTime.now().plusHours(4);
            confidence = Math.max(confidence, 0.7);
        }

        Forecast f = new Forecast();
        f.setDelivery(d);
        f.setPredictedDeliveryTime(predicted);
        f.setConfidence(Math.max(0.0, Math.min(1.0, confidence)));
        f.setPredictedStatus(d.getStatus());

        return forecastRepository.save(f);
    }

    public List<Forecast> getForecastsForDelivery(Long deliveryId) {
        return forecastRepository.findByDeliveryIdOrderByCreatedAtDesc(deliveryId);
    }

    public List<Forecast> listAll() {
        return forecastRepository.findAll();
    }
}
