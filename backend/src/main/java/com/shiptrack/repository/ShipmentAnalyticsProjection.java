package com.shiptrack.repository;

import com.shiptrack.enums.ShipmentStatus;

import java.time.LocalDateTime;

public interface ShipmentAnalyticsProjection {
    Long getId();
    String getTrackingNumber();
    ShipmentStatus getStatus();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
    Integer getEstimatedDurationMinutes();
    LocalDateTime getRouteUpdatedAt();
    LocalDateTime getDeliveredAt();
}
