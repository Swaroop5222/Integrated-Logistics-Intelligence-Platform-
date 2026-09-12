package com.shiptrack.dto;

import com.shiptrack.enums.TrafficCondition;

import java.time.LocalDateTime;

public class DeliveryEtaResponse {
    private Long shipmentId;
    private String trackingNumber;
    private double distanceKm;
    private double routeHours;
    private double trafficDelayHours;
    private double weatherDelayHours;
    private double routeChangeDelayHours;
    private double predictedDelayHours;
    private LocalDateTime expectedCompletionTime;
    private TrafficCondition trafficCondition;
    private boolean delayAlert;

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public double getRouteHours() { return routeHours; }
    public void setRouteHours(double routeHours) { this.routeHours = routeHours; }
    public double getTrafficDelayHours() { return trafficDelayHours; }
    public void setTrafficDelayHours(double trafficDelayHours) { this.trafficDelayHours = trafficDelayHours; }
    public double getWeatherDelayHours() { return weatherDelayHours; }
    public void setWeatherDelayHours(double weatherDelayHours) { this.weatherDelayHours = weatherDelayHours; }
    public double getRouteChangeDelayHours() { return routeChangeDelayHours; }
    public void setRouteChangeDelayHours(double routeChangeDelayHours) { this.routeChangeDelayHours = routeChangeDelayHours; }
    public double getPredictedDelayHours() { return predictedDelayHours; }
    public void setPredictedDelayHours(double predictedDelayHours) { this.predictedDelayHours = predictedDelayHours; }
    public LocalDateTime getExpectedCompletionTime() { return expectedCompletionTime; }
    public void setExpectedCompletionTime(LocalDateTime expectedCompletionTime) { this.expectedCompletionTime = expectedCompletionTime; }
    public TrafficCondition getTrafficCondition() { return trafficCondition; }
    public void setTrafficCondition(TrafficCondition trafficCondition) { this.trafficCondition = trafficCondition; }
    public boolean isDelayAlert() { return delayAlert; }
    public void setDelayAlert(boolean delayAlert) { this.delayAlert = delayAlert; }
}
