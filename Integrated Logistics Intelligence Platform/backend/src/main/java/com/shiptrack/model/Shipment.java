package com.shiptrack.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    private Double weightKg;
    private Double volumeCbm;

    private LocalDateTime pickupTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    public Shipment() {}

    public Long getId() { return id; }

    public Delivery getDelivery() { return delivery; }

    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public Double getWeightKg() { return weightKg; }

    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getVolumeCbm() { return volumeCbm; }

    public void setVolumeCbm(Double volumeCbm) { this.volumeCbm = volumeCbm; }

    public LocalDateTime getPickupTime() { return pickupTime; }

    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }

    public Route getRoute() { return route; }

    public void setRoute(Route route) { this.route = route; }
}
