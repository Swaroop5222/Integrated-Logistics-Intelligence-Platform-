package com.shiptrack.entity;

import com.shiptrack.enums.DelayRiskLevel;
import com.shiptrack.enums.TrafficCondition;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delay_predictions")
public class DelayPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    private double distanceKm;

    private double baseRouteMinutes;

    private double trafficDelayMinutes;

    private double weatherDelayMinutes;

    private double routeChangeDelayMinutes;

    private double totalPredictedDelayMinutes;

    private double totalPredictedTravelMinutes;

    private LocalDateTime predictedDeliveryTime;

    @Enumerated(EnumType.STRING)
    private DelayRiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    private TrafficCondition trafficCondition;

    @Column(length = 500)
    private String reason;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void setShipment(Shipment shipment2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setShipment'");
    }

    public void setDistanceKm(double distanceKm2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setDistanceKm'");
    }

    public void setBaseRouteMinutes(double baseRouteMinutes2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setBaseRouteMinutes'");
    }

    public void setTrafficDelayMinutes(double trafficDelayMinutes2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTrafficDelayMinutes'");
    }

    public void setWeatherDelayMinutes(double weatherDelayMinutes2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setWeatherDelayMinutes'");
    }

    public void setRouteChangeDelayMinutes(double routeChangeDelayMinutes2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setRouteChangeDelayMinutes'");
    }

    public void setTotalPredictedDelayMinutes(double totalPredictedDelayMinutes2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTotalPredictedDelayMinutes'");
    }

    public void setTotalPredictedTravelMinutes(double totalPredictedTravelMinutes2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTotalPredictedTravelMinutes'");
    }

    public void setPredictedDeliveryTime(LocalDateTime predictedDeliveryTime2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setPredictedDeliveryTime'");
    }

    public void setRiskLevel(DelayRiskLevel riskLevel2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setRiskLevel'");
    }

    public void setTrafficCondition(TrafficCondition traffic) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTrafficCondition'");
    }

    public void setReason(String reason2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setReason'");
    }

    // Generate getters and setters
}
