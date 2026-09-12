package com.shiptrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RouteResponse {
    private Long id;
    private Long shipmentId;
    private Long assignedOperatorId;
    private String origin;
    private String destination;
    private BigDecimal distanceKm;
    private Double estimatedDurationHours;
    private GeoPoint originCoordinates;
    private GeoPoint destinationCoordinates;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long value) { id = value; }
    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long value) { shipmentId = value; }
    public Long getAssignedOperatorId() { return assignedOperatorId; }
    public void setAssignedOperatorId(Long value) { assignedOperatorId = value; }
    public String getOrigin() { return origin; }
    public void setOrigin(String value) { origin = value; }
    public String getDestination() { return destination; }
    public void setDestination(String value) { destination = value; }
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal value) { distanceKm = value; }
    public Double getEstimatedDurationHours() { return estimatedDurationHours; }
    public void setEstimatedDurationHours(Double value) { estimatedDurationHours = value; }
    public GeoPoint getOriginCoordinates() { return originCoordinates; }
    public void setOriginCoordinates(GeoPoint value) { originCoordinates = value; }
    public GeoPoint getDestinationCoordinates() { return destinationCoordinates; }
    public void setDestinationCoordinates(GeoPoint value) { destinationCoordinates = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime value) { createdAt = value; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime value) { updatedAt = value; }
}
