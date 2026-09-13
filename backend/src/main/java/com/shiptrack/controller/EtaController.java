package com.shiptrack.controller;

import com.shiptrack.dto.EtaResponse;
import com.shiptrack.service.EtaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class EtaController {

    private final EtaService etaService;

    public EtaController(EtaService etaService) {
        this.etaService = etaService;
    }

    @GetMapping("/{id}/eta")
    public ResponseEntity<EtaResponse> calculateEta(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                etaService.calculateEta(id)
        );
    }
}