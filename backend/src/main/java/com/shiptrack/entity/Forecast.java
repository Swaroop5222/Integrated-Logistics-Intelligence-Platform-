package com.shiptrack.entity;

import com.shiptrack.enums.ShipmentStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
public class Forecast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "predicted_delivery_time", nullable = false)
    private LocalDateTime predictedDeliveryTime;

    @Column(nullable = false)
    private double confidence;

    @Enumerated(EnumType.STRING)
    @Column(name = "predicted_status", nullable = false)
    private ShipmentStatus predictedStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Forecast() {
    }

    public Long getId() {
        return id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public LocalDateTime getPredictedDeliveryTime() {
        return predictedDeliveryTime;
    }

    public void setPredictedDeliveryTime(LocalDateTime predictedDeliveryTime) {
        this.predictedDeliveryTime = predictedDeliveryTime;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public ShipmentStatus getPredictedStatus() {
        return predictedStatus;
    }

    public void setPredictedStatus(ShipmentStatus predictedStatus) {
        this.predictedStatus = predictedStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}