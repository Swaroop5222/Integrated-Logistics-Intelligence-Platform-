package com.shiptrack.controller;

import com.shiptrack.dto.RouteRequest;
import com.shiptrack.dto.RouteResponse;
import com.shiptrack.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/routes")
public class RouteController {
    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/shipments/{shipmentId}")
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR')")
    public ResponseEntity<RouteResponse> saveRoute(@PathVariable Long shipmentId,
                                                   @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.saveRoute(shipmentId, request));
    }

    @GetMapping("/shipments/{shipmentId}")
    public ResponseEntity<RouteResponse> getRoute(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(routeService.getRoute(shipmentId));
    }
}
