package com.shiptrack.dto;

import com.shiptrack.entity.Forecast;
import com.shiptrack.entity.Shipment;
import com.shiptrack.enums.ShipmentStatus;

import java.time.LocalDateTime;

public class ForecastResponse {

    private Long id;
    private ShipmentSummary shipment;
    private LocalDateTime predictedDeliveryTime;
    private double confidence;
    private ShipmentStatus predictedStatus;
    private LocalDateTime createdAt;

    public ForecastResponse(Long id, ShipmentSummary shipment,
                            LocalDateTime predictedDeliveryTime,
                            double confidence, ShipmentStatus predictedStatus,
                            LocalDateTime createdAt) {
        this.id = id;
        this.shipment = shipment;
        this.predictedDeliveryTime = predictedDeliveryTime;
        this.confidence = confidence;
        this.predictedStatus = predictedStatus;
        this.createdAt = createdAt;
    }

    public static ForecastResponse from(Forecast forecast) {
        Shipment shipment = forecast.getShipment();
        ShipmentSummary summary = shipment == null
                ? null
                : new ShipmentSummary(
                        shipment.getId(),
                        shipment.getTrackingNumber(),
                        shipment.getReferenceId(),
                        shipment.getStatus()
                );

        return new ForecastResponse(
                forecast.getId(),
                summary,
                forecast.getPredictedDeliveryTime(),
                forecast.getConfidence(),
                forecast.getPredictedStatus(),
                forecast.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public ShipmentSummary getShipment() {
        return shipment;
    }

    public LocalDateTime getPredictedDeliveryTime() {
        return predictedDeliveryTime;
    }

    public double getConfidence() {
        return confidence;
    }

    public ShipmentStatus getPredictedStatus() {
        return predictedStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public static class ShipmentSummary {
        private Long id;
        private String trackingNumber;
        private String referenceId;
        private ShipmentStatus status;

        public ShipmentSummary(Long id, String trackingNumber,
                               String referenceId, ShipmentStatus status) {
            this.id = id;
            this.trackingNumber = trackingNumber;
            this.referenceId = referenceId;
            this.status = status;
        }

        public Long getId() {
            return id;
        }

        public String getTrackingNumber() {
            return trackingNumber;
        }

        public String getReferenceId() {
            return referenceId;
        }

        public ShipmentStatus getStatus() {
            return status;
        }
    }
}
