package com.shiptrack.controller;

import com.shiptrack.dto.DeliveryPerformanceReportResponse;
import com.shiptrack.dto.ShipmentAnalyticsResponse;
import com.shiptrack.service.ShipmentAnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'LOGISTICS_OPERATOR', 'ADMINISTRATOR')")
public class ShipmentAnalyticsController {
    private final ShipmentAnalyticsService analyticsService;

    public ShipmentAnalyticsController(ShipmentAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/shipments")
    public ShipmentAnalyticsResponse getShipmentAnalytics(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        return analyticsService.getAnalytics(from, to);
    }

    @GetMapping("/delivery-performance")
    public DeliveryPerformanceReportResponse getDeliveryPerformance(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        return analyticsService.getDeliveryPerformance(from, to);
    }
}
