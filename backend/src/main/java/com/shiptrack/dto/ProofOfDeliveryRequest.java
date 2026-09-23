package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;

import java.time.LocalDateTime;

public class ProofOfDeliveryRequest {

    private LocalDateTime deliveredAt;
    private ShipmentStatus deliveryStatus;
    private String signature;
    private String remarks;

    public ProofOfDeliveryRequest() {
    }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    public ShipmentStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(ShipmentStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
