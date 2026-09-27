package com.shiptrack.entity;

import com.shiptrack.enums.DeliveryStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries", uniqueConstraints = {
        @UniqueConstraint(name = "uk_delivery_shipment", columnNames = "shipment_id")
})
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private Shipment shipment;

    /*
     * true -> customer was physically available
     * false -> customer was unavailable
     */
    @Column(name = "customer_available", nullable = false)
    private boolean customerAvailable;

    /*
     * Whether the shipment/customer details were verified.
     */
    @Column(name = "customer_details_verified", nullable = false)
    private boolean customerDetailsVerified;

    /*
     * Photo of the delivered shipment/package.
     *
     * Mandatory for EVERY delivery.
     */
    @Lob
    @Column(name = "delivery_photo", nullable = false, columnDefinition = "TEXT")
    private String deliveryPhoto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();

        if (status == null) {
            status = DeliveryStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}