package com.shiptrack.controller;

import com.shiptrack.dto.DelayPredictionRequest;
import com.shiptrack.dto.DelayPredictionResponse;
import com.shiptrack.service.DelayPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delay-predictions")
public class DelayPredictionController {

    private final DelayPredictionService delayPredictionService;

    public DelayPredictionController(
            DelayPredictionService delayPredictionService) {

        this.delayPredictionService =
                delayPredictionService;
    }

    @PostMapping("/shipment/{shipmentId}")
    public ResponseEntity<DelayPredictionResponse> predictDelay(
            @PathVariable Long shipmentId,
            @RequestBody DelayPredictionRequest request) {

        return ResponseEntity.ok(
                delayPredictionService.predict(
                        shipmentId,
                        request
                )
        );
    }
}
