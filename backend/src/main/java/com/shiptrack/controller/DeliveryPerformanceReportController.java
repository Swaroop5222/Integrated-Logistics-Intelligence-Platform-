package com.shiptrack.controller;

import com.shiptrack.dto.DeliveryPerformanceReportResponse;
import com.shiptrack.service.DeliveryPerformanceReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/performance")
@PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR', 'LOGISTICS_OPERATOR', 'CUSTOMER', 'SUPPORT_AGENT')")
public class DeliveryPerformanceReportController {

    private final DeliveryPerformanceReportService reportService;

    public DeliveryPerformanceReportController(DeliveryPerformanceReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<DeliveryPerformanceReportResponse> getReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getReport(from, to));
    }
}
