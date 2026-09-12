package com.shiptrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ShipmentRequest {

    private Long businessClientId;
    private Long customerId;
    private String referenceId;
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String deliveryAddress;
    private String packageDescription;
    private BigDecimal packageWeightKg;
    private Long assignedOperatorId;
    private LocalDate expectedDeliveryDate;
    private String priority;
    private String transportMode;
    private LocalDate pickupDate;

    public ShipmentRequest() {}

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public Long getBusinessClientId() {
        return businessClientId;
    }

    public void setBusinessClientId(Long businessClientId) {
        this.businessClientId = businessClientId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderPhone() {
        return senderPhone;
    }

    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }

    public String getSenderAddress() {
        return senderAddress;
    }

    public void setSenderAddress(String senderAddress) {
        this.senderAddress = senderAddress;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getReceiverAddress() {
        return receiverAddress;
    }

    public void setReceiverAddress(String receiverAddress) {
        this.receiverAddress = receiverAddress;
    }

    public String getPackageDescription() {
        return packageDescription;
    }

    public void setPackageDescription(String packageDescription) {
        this.packageDescription = packageDescription;
    }

    public BigDecimal getPackageWeightKg() {
        return packageWeightKg;
    }

    public void setPackageWeightKg(BigDecimal packageWeightKg) {
        this.packageWeightKg = packageWeightKg;
    }

    public Long getAssignedOperatorId() {
        return assignedOperatorId;
    }
     
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate)
    {
        this.expectedDeliveryDate=expectedDeliveryDate;
    }
    public LocalDate getExpectedDeliveryDate()
    {
        return expectedDeliveryDate;
    }
    public void setAssignedOperatorId(Long assignedOperatorId) {
        this.assignedOperatorId = assignedOperatorId;
    }

    public String getDeliveryAddress() {
        return deliveryAddress != null ? deliveryAddress : receiverAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
        if (this.receiverAddress == null) {
            this.receiverAddress = deliveryAddress;
        }
    }

    public String getPriority() {
        return priority != null ? priority : "Standard";
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTransportMode() {
        return transportMode != null ? transportMode : "Road";
    }

    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
    }

    public LocalDate getPickupDate() {
        return pickupDate;
    }

    public void setPickupDate(LocalDate pickupDate) {
        this.pickupDate = pickupDate;
    }
}
