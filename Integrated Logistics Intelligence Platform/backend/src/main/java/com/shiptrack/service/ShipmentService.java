package com.shiptrack.service;

import com.shiptrack.dto.ShipmentRequest;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.dto.ShipmentStatusHistoryResponse;
import com.shiptrack.dto.StatusUpdateRequest;

import java.util.List;

public interface ShipmentService {
    ShipmentResponse createShipment(ShipmentRequest request);
    ShipmentResponse getShipmentById(Long id);
    ShipmentResponse getShipmentByTrackingNumber(String trackingNumber);
    List<ShipmentResponse> getAllShipments();
    ShipmentResponse updateShipment(Long id, ShipmentRequest request);
    ShipmentResponse updateShipmentStatus(Long id, StatusUpdateRequest request);
    ShipmentResponse cancelShipment(Long id);
    List<ShipmentStatusHistoryResponse> getShipmentHistory(Long id);
}
