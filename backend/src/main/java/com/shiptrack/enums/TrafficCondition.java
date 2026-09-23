package com.shiptrack.enums;

public enum TrafficCondition {
    CLEAR(1.00),
    LIGHT(1.05),
    MODERATE(1.15),
    HEAVY(1.35),
    SEVERE(1.60);

    private final double multiplier;

    TrafficCondition(double multiplier) {
        this.multiplier = multiplier;
    }

    public double getMultiplier() {
        return multiplier;
    }
}
