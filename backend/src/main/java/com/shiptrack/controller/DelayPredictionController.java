package com.shiptrack.controller;

import com.shiptrack.dto.DelayPredictionResponse;
import com.shiptrack.service.DelayPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class DelayPredictionController {

    private final DelayPredictionService delayPredictionService;

    public DelayPredictionController(DelayPredictionService delayPredictionService) {
        this.delayPredictionService = delayPredictionService;
    }

    @GetMapping("/{id}/delay-prediction")
    public ResponseEntity<DelayPredictionResponse> predictDelay(@PathVariable Long id) {
        return ResponseEntity.ok(delayPredictionService.predictDelay(id));
    }
}

