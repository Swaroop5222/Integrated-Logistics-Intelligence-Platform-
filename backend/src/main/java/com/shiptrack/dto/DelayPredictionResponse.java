package com.shiptrack.dto;

import com.shiptrack.enums.DelayRiskLevel;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.enums.TrafficCondition;

import java.time.LocalDateTime;

public class DelayPredictionResponse {

    private Long shipmentId;

    private String trackingNumber;

    private ShipmentStatus currentStatus;

    private double distanceKm;

    private double baseRouteMinutes;

    private double trafficDelayMinutes;

    private double weatherDelayMinutes;

    private double routeChangeDelayMinutes;

    private double totalPredictedDelayMinutes;

    private double totalPredictedTravelMinutes;

    private LocalDateTime predictedDeliveryTime;

    private DelayRiskLevel riskLevel;

    private TrafficCondition trafficCondition;

    private String reason;

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public ShipmentStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(
            ShipmentStatus currentStatus) {

        this.currentStatus = currentStatus;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getBaseRouteMinutes() {
        return baseRouteMinutes;
    }

    public void setBaseRouteMinutes(
            double baseRouteMinutes) {

        this.baseRouteMinutes =
                baseRouteMinutes;
    }

    public double getTrafficDelayMinutes() {
        return trafficDelayMinutes;
    }

    public void setTrafficDelayMinutes(
            double trafficDelayMinutes) {

        this.trafficDelayMinutes =
                trafficDelayMinutes;
    }

    public double getWeatherDelayMinutes() {
        return weatherDelayMinutes;
    }

    public void setWeatherDelayMinutes(
            double weatherDelayMinutes) {

        this.weatherDelayMinutes =
                weatherDelayMinutes;
    }

    public double getRouteChangeDelayMinutes() {
        return routeChangeDelayMinutes;
    }

    public void setRouteChangeDelayMinutes(
            double routeChangeDelayMinutes) {

        this.routeChangeDelayMinutes =
                routeChangeDelayMinutes;
    }

    public double getTotalPredictedDelayMinutes() {
        return totalPredictedDelayMinutes;
    }

    public void setTotalPredictedDelayMinutes(
            double totalPredictedDelayMinutes) {

        this.totalPredictedDelayMinutes =
                totalPredictedDelayMinutes;
    }

    public double getTotalPredictedTravelMinutes() {
        return totalPredictedTravelMinutes;
    }

    public void setTotalPredictedTravelMinutes(
            double totalPredictedTravelMinutes) {

        this.totalPredictedTravelMinutes =
                totalPredictedTravelMinutes;
    }

    public LocalDateTime getPredictedDeliveryTime() {
        return predictedDeliveryTime;
    }

    public void setPredictedDeliveryTime(
            LocalDateTime predictedDeliveryTime) {

        this.predictedDeliveryTime =
                predictedDeliveryTime;
    }

    public DelayRiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(
            DelayRiskLevel riskLevel) {

        this.riskLevel = riskLevel;
    }

    public TrafficCondition getTrafficCondition() {
        return trafficCondition;
    }

    public void setTrafficCondition(
            TrafficCondition trafficCondition) {

        this.trafficCondition =
                trafficCondition;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
