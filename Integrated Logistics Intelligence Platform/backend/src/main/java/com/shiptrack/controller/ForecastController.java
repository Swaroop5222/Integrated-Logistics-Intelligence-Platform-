package com.shiptrack.controller;

import com.shiptrack.model.Forecast;
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
    public ResponseEntity<Forecast> generate(@RequestParam Long deliveryId) {
        Forecast f = forecastService.generateForecast(deliveryId);
        return ResponseEntity.ok(f);
    }

    @GetMapping("/delivery/{deliveryId}")
    public ResponseEntity<List<Forecast>> getByDelivery(@PathVariable Long deliveryId) {
        return ResponseEntity.ok(forecastService.getForecastsForDelivery(deliveryId));
    }

    @GetMapping
    public ResponseEntity<List<Forecast>> listAll() {
        // For convenience: return all forecasts (not paginated)
        return ResponseEntity.ok(forecastService.listAll());
    }
}
