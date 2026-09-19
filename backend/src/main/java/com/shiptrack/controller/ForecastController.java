package com.shiptrack.controller;

import com.shiptrack.entity.Forecast;
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
    public ResponseEntity<Forecast> generateForecast(
            @RequestParam Long shipmentId) {

        return ResponseEntity.ok(
                forecastService.generateForecast(shipmentId)
        );
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<List<Forecast>> getByShipment(
            @PathVariable Long shipmentId) {

        return ResponseEntity.ok(
                forecastService.getForecastsForShipment(shipmentId)
        );
    }

    @GetMapping
    public ResponseEntity<List<Forecast>> listAll() {

        return ResponseEntity.ok(
                forecastService.listAll()
        );
    }
}
