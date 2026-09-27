package com.shiptrack.dto;

import com.shiptrack.enums.DeliveryStatus;

import java.time.LocalDateTime;

public class DeliveryResponse {

    private Long deliveryId;

    private Long shipmentId;

    private boolean customerAvailable;

    private boolean customerDetailsVerified;

    private boolean photoUploaded;

    private DeliveryStatus status;

    private LocalDateTime deliveryDate;

    private String notes;

    private LocalDateTime confirmedAt;

    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public boolean isCustomerAvailable() {
        return customerAvailable;
    }

    public void setCustomerAvailable(boolean customerAvailable) {
        this.customerAvailable = customerAvailable;
    }

    public boolean isCustomerDetailsVerified() {
        return customerDetailsVerified;
    }

    public void setCustomerDetailsVerified(boolean customerDetailsVerified) {
        this.customerDetailsVerified = customerDetailsVerified;
    }

    public boolean isPhotoUploaded() {
        return photoUploaded;
    }

    public void setPhotoUploaded(boolean photoUploaded) {
        this.photoUploaded = photoUploaded;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }
}