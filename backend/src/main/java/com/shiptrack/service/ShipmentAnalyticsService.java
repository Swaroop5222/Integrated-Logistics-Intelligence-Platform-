package com.shiptrack.service;

import com.shiptrack.dto.ShipmentAnalyticsResponse;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.enums.ShipmentStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class ShipmentAnalyticsService {

    private static final Set<ShipmentStatus> IN_TRANSIT_STATUSES = Set.of(
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY);

    private final ShipmentService shipmentService;

    public ShipmentAnalyticsService(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    public ShipmentAnalyticsResponse getAnalytics(LocalDate fromDate, LocalDate toDate) {
        validateDateRange(fromDate, toDate);

        List<ShipmentResponse> shipments = shipmentService.getAllShipments().stream()
                .filter(shipment -> isInRange(shipment.getCreatedAt(), fromDate, toDate))
                .toList();

        ShipmentAnalyticsResponse response = new ShipmentAnalyticsResponse();
        response.setFromDate(fromDate);
        response.setToDate(toDate);
        response.setTotalShipments(shipments.size());
        response.setDeliveredShipments(count(shipments, ShipmentStatus.DELIVERED));
        response.setDelayedShipments(count(shipments, ShipmentStatus.FAILED_DELIVERY));
        response.setInTransitShipments(shipments.stream()
                .filter(shipment -> IN_TRANSIT_STATUSES.contains(shipment.getStatus()))
                .count());
        response.setCreatedShipments(count(shipments, ShipmentStatus.CREATED));
        response.setPickedUpShipments(count(shipments, ShipmentStatus.PICKED_UP));
        response.setOutForDeliveryShipments(count(shipments, ShipmentStatus.OUT_FOR_DELIVERY));
        response.setCancelledShipments(count(shipments, ShipmentStatus.CANCELLED));
        return response;
    }

    static void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("The from date must be on or before the to date.");
        }
    }

    static boolean isInRange(LocalDateTime value, LocalDate fromDate, LocalDate toDate) {
        if (value == null) {
            return fromDate == null && toDate == null;
        }

        LocalDate date = value.toLocalDate();
        return (fromDate == null || !date.isBefore(fromDate))
                && (toDate == null || !date.isAfter(toDate));
    }

    private long count(List<ShipmentResponse> shipments, ShipmentStatus status) {
        return shipments.stream().filter(shipment -> shipment.getStatus() == status).count();
    }
}
