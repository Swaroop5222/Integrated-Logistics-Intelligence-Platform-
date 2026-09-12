package com.shiptrack.controller;

import com.shiptrack.dto.DeliveryEtaRequest;
import com.shiptrack.dto.DeliveryEtaResponse;
import com.shiptrack.service.DeliveryEtaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class DeliveryEtaController {
    private final DeliveryEtaService deliveryEtaService;

    public DeliveryEtaController(DeliveryEtaService deliveryEtaService) {
        this.deliveryEtaService = deliveryEtaService;
    }

    @PostMapping("/{id}/eta")
    public ResponseEntity<DeliveryEtaResponse> calculateEta(
            @PathVariable Long id,
            @RequestBody DeliveryEtaRequest request) {
        return ResponseEntity.ok(deliveryEtaService.calculate(id, request));
    }
}
