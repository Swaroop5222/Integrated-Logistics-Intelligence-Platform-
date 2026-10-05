package com.shiptrack.controller;

import com.shiptrack.entity.Forecast;
import com.shiptrack.dto.ForecastResponse;
import com.shiptrack.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecasts")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ForecastResponse> generateForecast(
            @RequestParam Long shipmentId) {

        return ResponseEntity.ok(
                ForecastResponse.from(
                        forecastService.generateForecast(shipmentId)
                )
        );
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<List<ForecastResponse>> getByShipment(
            @PathVariable Long shipmentId) {

        return ResponseEntity.ok(
                forecastService.getForecastsForShipment(shipmentId)
                        .stream()
                        .map(ForecastResponse::from)
                        .toList()
        );
    }

    @GetMapping
    public ResponseEntity<List<ForecastResponse>> listAll() {

        return ResponseEntity.ok(
                forecastService.listAll()
                        .stream()
                        .map(ForecastResponse::from)
                        .toList()
        );
    }
}
