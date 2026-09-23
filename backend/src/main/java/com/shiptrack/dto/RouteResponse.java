package com.shiptrack.dto;

import com.shiptrack.entity.Route;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RouteResponse {

    private Long id;
    private Long shipmentId;
    private String trackingNumber;

    private String origin;
    private String destination;

    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;

    private BigDecimal distanceKm;
    private Integer estimatedDurationMinutes;
    private String geometry;

    private Long assignedOperatorId;
    private String assignedOperatorName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RouteResponse from(Route route) {
    return from(route, null);
}

public static RouteResponse from(Route route, String geometry) {

    RouteResponse response = new RouteResponse();

    response.id = route.getId();

    if (route.getShipment() != null) {
        response.shipmentId = route.getShipment().getId();
        response.trackingNumber = route.getShipment().getTrackingNumber();
    }

    response.origin = route.getOrigin();
    response.destination = route.getDestination();

    response.originLatitude = route.getOriginLatitude();
    response.originLongitude = route.getOriginLongitude();

    response.destinationLatitude = route.getDestinationLatitude();
    response.destinationLongitude = route.getDestinationLongitude();

    response.distanceKm = route.getDistanceKm();
    response.estimatedDurationMinutes =
            route.getEstimatedDurationMinutes();

    response.geometry = geometry;

    if (route.getAssignedOperator() != null) {
        response.assignedOperatorId =
                route.getAssignedOperator().getId();

        response.assignedOperatorName =
                route.getAssignedOperator().getFullName();
    }

    response.createdAt = route.getCreatedAt();
    response.updatedAt = route.getUpdatedAt();

    return response;
}

    public Long getId() {
        return id;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public Double getOriginLatitude() {
        return originLatitude;
    }

    public Double getOriginLongitude() {
        return originLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public BigDecimal getDistanceKm() {
        return distanceKm;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public String getGeometry() {
        return geometry;
    }

    public Long getAssignedOperatorId() {
        return assignedOperatorId;
    }

    public String getAssignedOperatorName() {
        return assignedOperatorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
