package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ShipmentResponse {

    private Long id;
    private String trackingNumber;
    private Long businessClientId;
    private String businessClientName;
    private Long customerId;
    private String customerName;
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String packageDescription;
    private BigDecimal packageWeightKg;
    private ShipmentStatus status;
    private Long assignedOperatorId;
    private String assignedOperatorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ShipmentResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public Long getBusinessClientId() {
        return businessClientId;
    }

    public void setBusinessClientId(Long businessClientId) {
        this.businessClientId = businessClientId;
    }

    public String getBusinessClientName() {
        return businessClientName;
    }

    public void setBusinessClientName(String businessClientName) {
        this.businessClientName = businessClientName;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public Long getAssignedOperatorId() {
        return assignedOperatorId;
    }

    public void setAssignedOperatorId(Long assignedOperatorId) {
        this.assignedOperatorId = assignedOperatorId;
    }

    public String getAssignedOperatorName() {
        return assignedOperatorName;
    }

    public void setAssignedOperatorName(String assignedOperatorName) {
        this.assignedOperatorName = assignedOperatorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
