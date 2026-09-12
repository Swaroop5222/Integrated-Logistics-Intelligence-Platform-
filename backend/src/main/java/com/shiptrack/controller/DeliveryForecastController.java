package com.shiptrack.controller;

import com.shiptrack.dto.DeliveryForecastResponse;
import com.shiptrack.service.DeliveryForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forecasts")
public class DeliveryForecastController {

    private final DeliveryForecastService deliveryForecastService;

    public DeliveryForecastController(DeliveryForecastService deliveryForecastService) {
        this.deliveryForecastService = deliveryForecastService;
    }

    @GetMapping("/delivery")
    public ResponseEntity<DeliveryForecastResponse> generateDeliveryForecast(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(deliveryForecastService.generateForecast(days));
    }
}

