package com.shiptrackpro.backend.controller;

import com.shiptrackpro.backend.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.dto.UpdateShipmentRequest;
import com.shiptrackpro.backend.dto.UpdateShipmentStatusRequest;
import com.shiptrackpro.backend.entity.Shipment;
import com.shiptrackpro.backend.entity.ShipmentHistory;
import com.shiptrackpro.backend.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(originPatterns = {
        "http://localhost:*",
        "http://127.0.0.1:*"
})
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    public ResponseEntity<Shipment> createShipment(
            @Valid @RequestBody CreateShipmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(shipmentService.createShipment(request));
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {

        return ResponseEntity.ok(
                shipmentService.getAllShipments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shipment> getShipment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shipmentService.getShipment(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<Shipment> getShipmentByTrackingNumber(
            @PathVariable String trackingNumber) {

        return ResponseEntity.ok(
                shipmentService
                        .getShipmentByTrackingNumber(trackingNumber));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shipment> updateShipment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentRequest request) {

        return ResponseEntity.ok(
                shipmentService.updateShipment(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {

        return ResponseEntity.ok(
                shipmentService.updateStatus(id, request));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ShipmentHistory>> getShipmentHistory(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shipmentService.getShipmentHistory(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Shipment> cancelShipment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shipmentService.cancelShipment(id));
    }
}
