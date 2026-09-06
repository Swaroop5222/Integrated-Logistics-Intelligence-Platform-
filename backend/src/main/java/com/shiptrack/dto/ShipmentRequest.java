package com.shiptrack.dto;

import java.math.BigDecimal;

public class ShipmentRequest {

    private Long businessClientId;
    private Long customerId;
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String packageDescription;
    private BigDecimal packageWeightKg;
    private Long assignedOperatorId;

    public ShipmentRequest() {}

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

    public void setAssignedOperatorId(Long assignedOperatorId) {
        this.assignedOperatorId = assignedOperatorId;
    }
}
