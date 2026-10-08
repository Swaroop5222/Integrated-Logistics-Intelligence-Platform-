package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;
import java.time.LocalDateTime;

public class DeliveryPerformanceRecord {

    private Long shipmentId;
    private String trackingNumber;
    private String receiverName;
    private ShipmentStatus status;
    private String category;
    private LocalDateTime completedAt;
    private LocalDateTime delayedAt;
    private long failedDeliveryAttempts;

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public LocalDateTime getDelayedAt() { return delayedAt; }
    public void setDelayedAt(LocalDateTime delayedAt) { this.delayedAt = delayedAt; }
    public long getFailedDeliveryAttempts() { return failedDeliveryAttempts; }
    public void setFailedDeliveryAttempts(long failedDeliveryAttempts) { this.failedDeliveryAttempts = failedDeliveryAttempts; }
}
