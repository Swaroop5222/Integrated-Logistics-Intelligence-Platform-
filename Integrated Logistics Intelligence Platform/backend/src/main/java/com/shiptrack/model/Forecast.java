package com.shiptrack.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
public class Forecast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    private LocalDateTime predictedDeliveryTime;

    private double confidence; // 0.0 - 1.0

    @Enumerated(EnumType.STRING)
    private DeliveryStatus predictedStatus;

    private LocalDateTime createdAt;

    public Forecast() {}

    public Long getId() { return id; }

    public Delivery getDelivery() { return delivery; }

    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public LocalDateTime getPredictedDeliveryTime() { return predictedDeliveryTime; }

    public void setPredictedDeliveryTime(LocalDateTime predictedDeliveryTime) { this.predictedDeliveryTime = predictedDeliveryTime; }

    public double getConfidence() { return confidence; }

    public void setConfidence(double confidence) { this.confidence = confidence; }

    public DeliveryStatus getPredictedStatus() { return predictedStatus; }

    public void setPredictedStatus(DeliveryStatus predictedStatus) { this.predictedStatus = predictedStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }
}
