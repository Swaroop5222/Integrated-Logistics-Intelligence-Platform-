package com.shiptrack.service;

import com.shiptrack.dto.EtaResponse;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.entity.Route;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EtaServiceImpl implements EtaService {

    private final RouteRepository routeRepository;
    private final ShipmentService shipmentService;

    public EtaServiceImpl(RouteRepository routeRepository,
                          ShipmentService shipmentService) {
        this.routeRepository = routeRepository;
        this.shipmentService = shipmentService;
    }

    @Override
    public EtaResponse calculateEta(Long shipmentId) {

        // This also checks whether the logged-in user can access the shipment
        ShipmentResponse shipment = shipmentService.getShipmentById(shipmentId);

        Route route = routeRepository.findByShipmentId(shipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Route not found for shipment ID: " + shipmentId
                        ));

        if (route.getEstimatedDurationMinutes() == null ||
                route.getEstimatedDurationMinutes() <= 0) {

            throw new IllegalArgumentException(
                    "Estimated route duration is required to calculate ETA."
            );
        }

        LocalDateTime estimatedArrivalTime =
                LocalDateTime.now()
                        .plusMinutes(route.getEstimatedDurationMinutes());

        EtaResponse response = new EtaResponse();

        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setOrigin(route.getOrigin());
        response.setDestination(route.getDestination());

        if (route.getDistanceKm() != null) {
            response.setDistanceKm(route.getDistanceKm().doubleValue());
        }

        response.setEstimatedDurationMinutes(
                route.getEstimatedDurationMinutes()
        );

        response.setEstimatedArrivalTime(
                estimatedArrivalTime
        );

        return response;
    }
}