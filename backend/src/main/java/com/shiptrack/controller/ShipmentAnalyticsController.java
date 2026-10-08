package com.shiptrack.controller;

import com.shiptrack.dto.ShipmentAnalyticsResponse;
import com.shiptrack.service.ShipmentAnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'SUPPORT_AGENT')")
public class ShipmentAnalyticsController {

    private final ShipmentAnalyticsService analyticsService;

    public ShipmentAnalyticsController(ShipmentAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<ShipmentAnalyticsResponse> getAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.getAnalytics(from, to));
    }
}
