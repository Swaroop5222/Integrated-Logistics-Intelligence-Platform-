package com.shiptrack.dto;

import java.time.LocalDate;

public class ShipmentAnalyticsResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private long totalShipments;
    private long deliveredShipments;
    private long delayedShipments;
    private long inTransitShipments;
    private long createdShipments;
    private long pickedUpShipments;
    private long outForDeliveryShipments;
    private long cancelledShipments;

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public long getTotalShipments() { return totalShipments; }
    public void setTotalShipments(long totalShipments) { this.totalShipments = totalShipments; }
    public long getDeliveredShipments() { return deliveredShipments; }
    public void setDeliveredShipments(long deliveredShipments) { this.deliveredShipments = deliveredShipments; }
    public long getDelayedShipments() { return delayedShipments; }
    public void setDelayedShipments(long delayedShipments) { this.delayedShipments = delayedShipments; }
    public long getInTransitShipments() { return inTransitShipments; }
    public void setInTransitShipments(long inTransitShipments) { this.inTransitShipments = inTransitShipments; }
    public long getCreatedShipments() { return createdShipments; }
    public void setCreatedShipments(long createdShipments) { this.createdShipments = createdShipments; }
    public long getPickedUpShipments() { return pickedUpShipments; }
    public void setPickedUpShipments(long pickedUpShipments) { this.pickedUpShipments = pickedUpShipments; }
    public long getOutForDeliveryShipments() { return outForDeliveryShipments; }
    public void setOutForDeliveryShipments(long outForDeliveryShipments) { this.outForDeliveryShipments = outForDeliveryShipments; }
    public long getCancelledShipments() { return cancelledShipments; }
    public void setCancelledShipments(long cancelledShipments) { this.cancelledShipments = cancelledShipments; }
}
