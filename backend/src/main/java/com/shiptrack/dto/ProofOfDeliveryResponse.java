package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;

import java.time.LocalDateTime;

public class ProofOfDeliveryResponse {

    private Long id;
    private Long shipmentId;
    private String trackingNumber;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private LocalDateTime deliveredAt;
    private ShipmentStatus deliveryStatus;
    private String signature;
    private String remarks;
    private Long deliveredByUserId;
    private String deliveredByUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProofOfDeliveryResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    public ShipmentStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(ShipmentStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Long getDeliveredByUserId() { return deliveredByUserId; }
    public void setDeliveredByUserId(Long deliveredByUserId) { this.deliveredByUserId = deliveredByUserId; }
    public String getDeliveredByUserName() { return deliveredByUserName; }
    public void setDeliveredByUserName(String deliveredByUserName) { this.deliveredByUserName = deliveredByUserName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
