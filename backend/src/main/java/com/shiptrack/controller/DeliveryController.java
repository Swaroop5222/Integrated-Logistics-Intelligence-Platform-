package com.shiptrack.controller;

import com.shiptrack.dto.DeliveryConfirmationRequest;
import com.shiptrack.dto.DeliveryResponse;
import com.shiptrack.dto.SignatureRequest;
import com.shiptrack.dto.SignatureResponse;
import com.shiptrack.service.DeliveryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

        private final DeliveryService deliveryService;

        public DeliveryController(
                        DeliveryService deliveryService) {

                this.deliveryService = deliveryService;
        }

        @PostMapping("/confirm")
        public ResponseEntity<DeliveryResponse> confirmDelivery(
                        @RequestBody DeliveryConfirmationRequest request) {

                DeliveryResponse response = deliveryService.confirmDelivery(request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @GetMapping("/shipment/{shipmentId}")
        public ResponseEntity<DeliveryResponse> getDelivery(
                        @PathVariable Long shipmentId) {

                return ResponseEntity.ok(
                                deliveryService.getDeliveryByShipmentId(
                                                shipmentId));
        }

        @PostMapping("/{deliveryId}/signature")
        public ResponseEntity<SignatureResponse> saveSignature(
                        @PathVariable Long deliveryId,
                        @RequestBody SignatureRequest request) {

                SignatureResponse response = deliveryService.saveSignature(
                                deliveryId,
                                request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @GetMapping("/{deliveryId}/signature")
        public ResponseEntity<SignatureResponse> getSignature(
                        @PathVariable Long deliveryId) {

                return ResponseEntity.ok(
                                deliveryService.getSignature(
                                                deliveryId));
        }

        @PostMapping("/{deliveryId}/signature/verify")
        public ResponseEntity<SignatureResponse> verifySignature(
                        @PathVariable Long deliveryId) {

                return ResponseEntity.ok(
                                deliveryService.verifySignature(
                                                deliveryId));
        }
}