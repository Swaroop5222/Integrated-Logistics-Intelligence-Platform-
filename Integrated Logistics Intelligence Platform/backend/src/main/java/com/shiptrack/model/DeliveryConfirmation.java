package com.shiptrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "delivery_confirmations",
    indexes = {
        @Index(name = "idx_delivery_confirmation_tracking_number", columnList = "tracking_number", unique = true)
    }
)
public class DeliveryConfirmation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true)
    private String trackingNumber;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "delivery_address", nullable = false, length = 1000)
    private String deliveryAddress;

    @Column(name = "confirmation_method", nullable = false)
    private String confirmationMethod;

    @Column(name = "delivery_status", nullable = false)
    private String deliveryStatus;

    @Column(name = "confirmation_time")
    private LocalDateTime confirmationTime;

    @Column(name = "delivery_notes", length = 2000)
    private String deliveryNotes;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "proof_image_url")
    private String proofImageUrl;

    @Column(name = "signature_image_url")
    private String signatureImageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public DeliveryConfirmation() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.confirmationTime == null) {
            this.confirmationTime = now;
        }
        if (this.deliveryStatus == null || this.deliveryStatus.isBlank()) {
            this.deliveryStatus = "DELIVERED";
        }
        if (this.confirmationMethod == null || this.confirmationMethod.isBlank()) {
            this.confirmationMethod = "SIGNATURE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getConfirmationMethod() {
        return confirmationMethod;
    }

    public void setConfirmationMethod(String confirmationMethod) {
        this.confirmationMethod = confirmationMethod;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public LocalDateTime getConfirmationTime() {
        return confirmationTime;
    }

    public void setConfirmationTime(LocalDateTime confirmationTime) {
        this.confirmationTime = confirmationTime;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getProofImageUrl() {
        return proofImageUrl;
    }

    public void setProofImageUrl(String proofImageUrl) {
        this.proofImageUrl = proofImageUrl;
    }

    public String getSignatureImageUrl() {
        return signatureImageUrl;
    }

    public void setSignatureImageUrl(String signatureImageUrl) {
        this.signatureImageUrl = signatureImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
