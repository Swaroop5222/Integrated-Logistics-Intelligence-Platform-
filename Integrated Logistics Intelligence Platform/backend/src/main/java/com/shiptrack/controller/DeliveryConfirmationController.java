package com.shiptrack.controller;

import com.shiptrack.model.DeliveryConfirmation;
import com.shiptrack.service.DeliveryConfirmationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-confirmations")
public class DeliveryConfirmationController {

    private final DeliveryConfirmationService deliveryConfirmationService;

    public DeliveryConfirmationController(DeliveryConfirmationService deliveryConfirmationService) {
        this.deliveryConfirmationService = deliveryConfirmationService;
    }

    @PostMapping
    public ResponseEntity<DeliveryConfirmation> saveConfirmation(@RequestBody DeliveryConfirmation confirmation) {
        DeliveryConfirmation savedConfirmation = deliveryConfirmationService.saveConfirmation(confirmation);
        return ResponseEntity.ok(savedConfirmation);
    }

    @GetMapping
    public ResponseEntity<List<DeliveryConfirmation>> getAllConfirmations() {
        return ResponseEntity.ok(deliveryConfirmationService.getAllConfirmations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryConfirmation> getConfirmationById(@PathVariable Long id) {
        return deliveryConfirmationService.getConfirmationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<DeliveryConfirmation> getConfirmationByTrackingNumber(@PathVariable String trackingNumber) {
        return deliveryConfirmationService.getConfirmationByTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
