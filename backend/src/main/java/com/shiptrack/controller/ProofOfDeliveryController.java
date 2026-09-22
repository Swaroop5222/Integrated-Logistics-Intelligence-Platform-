package com.shiptrack.controller;

import com.shiptrack.dto.ProofOfDeliveryRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.service.ProofOfDeliveryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService proofOfDeliveryService;

    public ProofOfDeliveryController(ProofOfDeliveryService proofOfDeliveryService) {
        this.proofOfDeliveryService = proofOfDeliveryService;
    }

    @PostMapping("/{id}/pod")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR')")
    public ResponseEntity<ProofOfDeliveryResponse> createPod(
            @PathVariable Long id,
            @RequestBody ProofOfDeliveryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proofOfDeliveryService.createProofOfDelivery(id, request));
    }

    @GetMapping("/{id}/pod")
    public ResponseEntity<ProofOfDeliveryResponse> getPod(@PathVariable Long id) {
        return ResponseEntity.ok(proofOfDeliveryService.getProofOfDelivery(id));
    }
}
