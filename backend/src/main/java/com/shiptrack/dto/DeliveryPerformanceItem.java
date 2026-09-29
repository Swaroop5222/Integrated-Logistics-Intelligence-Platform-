package com.shiptrack.dto;

import java.time.LocalDateTime;

public record DeliveryPerformanceItem(
        Long shipmentId,
        String trackingNumber,
        LocalDateTime createdAt,
        LocalDateTime routeEstimatedAt,
        LocalDateTime deliveredAt,
        Integer estimatedDurationMinutes,
        Long actualDurationMinutes,
        String performance) {
}
