package com.shiptrack.dto;

import java.time.LocalDateTime;

public class DeliveryConfirmationRequest {

    private Long shipmentId;

    private boolean customerAvailable;

    private boolean customerDetailsVerified;

    private String deliveryPhoto;

    private LocalDateTime deliveryDate;

    private String notes;

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

    public String getDeliveryPhoto() {
        return deliveryPhoto;
    }

    public void setDeliveryPhoto(String deliveryPhoto) {
        this.deliveryPhoto = deliveryPhoto;
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
}