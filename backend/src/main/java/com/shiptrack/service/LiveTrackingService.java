package com.shiptrack.service;

import com.shiptrack.dto.LiveTrackingResponse;
import com.shiptrack.dto.LocationUpdateRequest;
import com.shiptrack.dto.ShipmentLocationResponse;

import java.util.List;

public interface LiveTrackingService {
    ShipmentLocationResponse updateLocation(Long shipmentId, LocationUpdateRequest request);
    ShipmentLocationResponse getCurrentLocation(Long shipmentId);
    List<ShipmentLocationResponse> getLocationHistory(Long shipmentId);
    LiveTrackingResponse getLiveTracking(Long shipmentId);
}
