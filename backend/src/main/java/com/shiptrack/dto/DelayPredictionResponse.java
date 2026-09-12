package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;

import java.time.LocalDate;

public class DelayPredictionResponse {
    private Long shipmentId;
    private String trackingNumber;
    private ShipmentStatus status;
    private LocalDate expectedDeliveryDate;
    private LocalDate predictedDeliveryDate;
    private double predictedDelayHours;
    private int riskScore;
    private String riskLevel;
    private String predictionMethod;
    private String message;
    private boolean alertCreated;

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public LocalDate getPredictedDeliveryDate() { return predictedDeliveryDate; }
    public void setPredictedDeliveryDate(LocalDate predictedDeliveryDate) { this.predictedDeliveryDate = predictedDeliveryDate; }
    public double getPredictedDelayHours() { return predictedDelayHours; }
    public void setPredictedDelayHours(double predictedDelayHours) { this.predictedDelayHours = predictedDelayHours; }
    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getPredictionMethod() { return predictionMethod; }
    public void setPredictionMethod(String predictionMethod) { this.predictionMethod = predictionMethod; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isAlertCreated() { return alertCreated; }
    public void setAlertCreated(boolean alertCreated) { this.alertCreated = alertCreated; }
}
