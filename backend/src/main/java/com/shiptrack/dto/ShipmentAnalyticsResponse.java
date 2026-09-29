package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public record ShipmentAnalyticsResponse(
        LocalDate from,
        LocalDate to,
        LocalDateTime generatedAt,
        long totalShipments,
        long deliveredShipments,
        long inTransitShipments,
        long delayedShipments,
        long failedDeliveries,
        long cancelledShipments,
        Map<ShipmentStatus, Long> statusCounts) {
}
