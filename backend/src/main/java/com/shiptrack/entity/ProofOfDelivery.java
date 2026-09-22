package com.shiptrack.entity;

import com.shiptrack.enums.ShipmentStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "proof_of_delivery", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pod_shipment", columnNames = "shipment_id")
}, indexes = {
        @Index(name = "idx_pod_shipment", columnList = "shipment_id"),
        @Index(name = "idx_pod_delivered_at", columnList = "delivered_at")
})
public class ProofOfDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private Shipment shipment;

    @Column(name = "receiver_name", nullable = false, length = 150)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 30)
    private String receiverPhone;

    @Column(name = "receiver_address", nullable = false, length = 500)
    private String receiverAddress;

    @Column(name = "delivered_at", nullable = false)
    private LocalDateTime deliveredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 30)
    private ShipmentStatus deliveryStatus;

    /** Signature as a data URL/base64 string or a persisted signature reference. */
    @Lob
    @Column(name = "signature", nullable = false, columnDefinition = "TEXT")
    private String signature;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delivered_by_user_id", nullable = false)
    private User deliveredBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ProofOfDelivery() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }
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
    public User getDeliveredBy() { return deliveredBy; }
    public void setDeliveredBy(User deliveredBy) { this.deliveredBy = deliveredBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
