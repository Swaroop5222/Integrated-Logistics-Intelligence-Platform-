package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;
import java.util.List;

public class LiveTrackingResponse {
    private Long shipmentId;
    private String trackingNumber;
    private ShipmentStatus status;
    private Long assignedOperatorId;
    private String assignedOperatorName;
    private String senderAddress;
    private String receiverAddress;
    private ShipmentLocationResponse currentLocation;
    private List<ShipmentLocationResponse> locationHistory;

    public LiveTrackingResponse() {}
    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }
    public Long getAssignedOperatorId() { return assignedOperatorId; }
    public void setAssignedOperatorId(Long assignedOperatorId) { this.assignedOperatorId = assignedOperatorId; }
    public String getAssignedOperatorName() { return assignedOperatorName; }
    public void setAssignedOperatorName(String assignedOperatorName) { this.assignedOperatorName = assignedOperatorName; }
    public String getSenderAddress() { return senderAddress; }
    public void setSenderAddress(String senderAddress) { this.senderAddress = senderAddress; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
    public ShipmentLocationResponse getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(ShipmentLocationResponse currentLocation) { this.currentLocation = currentLocation; }
    public List<ShipmentLocationResponse> getLocationHistory() { return locationHistory; }
    public void setLocationHistory(List<ShipmentLocationResponse> locationHistory) { this.locationHistory = locationHistory; }
}
