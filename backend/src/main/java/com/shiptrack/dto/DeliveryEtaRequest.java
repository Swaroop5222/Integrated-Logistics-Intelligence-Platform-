package com.shiptrack.dto;

import com.shiptrack.enums.TrafficCondition;

public class DeliveryEtaRequest {
    private GeoPoint destination;
    private TrafficCondition trafficCondition = TrafficCondition.MODERATE;
    private double weatherDelayHours;
    private double routeChangeDelayHours;

    public GeoPoint getDestination() {
        return destination;
    }

    public void setDestination(GeoPoint destination) {
        this.destination = destination;
    }

    public TrafficCondition getTrafficCondition() {
        return trafficCondition;
    }

    public void setTrafficCondition(TrafficCondition trafficCondition) {
        this.trafficCondition = trafficCondition;
    }

    public double getWeatherDelayHours() {
        return weatherDelayHours;
    }

    public void setWeatherDelayHours(double weatherDelayHours) {
        this.weatherDelayHours = weatherDelayHours;
    }

    public double getRouteChangeDelayHours() {
        return routeChangeDelayHours;
    }

    public void setRouteChangeDelayHours(double routeChangeDelayHours) {
        this.routeChangeDelayHours = routeChangeDelayHours;
    }
}
