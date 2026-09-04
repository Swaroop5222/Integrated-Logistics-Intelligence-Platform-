package com.shiptrack.controller;

import com.shiptrack.dto.ShipmentRequest;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.dto.ShipmentStatusHistoryResponse;
import com.shiptrack.dto.StatusUpdateRequest;
import com.shiptrack.service.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR')")
    public ResponseEntity<ShipmentResponse> createShipment(@RequestBody ShipmentRequest request) {
        ShipmentResponse response = shipmentService.createShipment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipments() {
        List<ShipmentResponse> shipments = shipmentService.getAllShipments();
        return ResponseEntity.ok(shipments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        ShipmentResponse response = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentResponse> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        ShipmentResponse response = shipmentService.getShipmentByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR')")
    public ResponseEntity<ShipmentResponse> updateShipment(@PathVariable Long id, @RequestBody ShipmentRequest request) {
        ShipmentResponse response = shipmentService.updateShipment(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR')")
    public ResponseEntity<ShipmentResponse> updateShipmentStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        ShipmentResponse response = shipmentService.updateShipmentStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR')")
    public ResponseEntity<ShipmentResponse> cancelShipment(@PathVariable Long id) {
        ShipmentResponse response = shipmentService.cancelShipment(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ShipmentStatusHistoryResponse>> getShipmentHistory(@PathVariable Long id) {
        List<ShipmentStatusHistoryResponse> history = shipmentService.getShipmentHistory(id);
        return ResponseEntity.ok(history);
    }
}
