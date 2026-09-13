package com.shiptrack.controller;

import com.shiptrack.dto.LiveTrackingResponse;
import com.shiptrack.dto.LocationUpdateRequest;
import com.shiptrack.dto.ShipmentLocationResponse;
import com.shiptrack.service.LiveTrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class LiveTrackingController {

    private final LiveTrackingService liveTrackingService;

    public LiveTrackingController(LiveTrackingService liveTrackingService) {
        this.liveTrackingService = liveTrackingService;
    }

    @PatchMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR')")
    public ResponseEntity<ShipmentLocationResponse> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationUpdateRequest request) {
        return ResponseEntity.ok(liveTrackingService.updateLocation(id, request));
    }

    @GetMapping("/{id}/location")
    public ResponseEntity<ShipmentLocationResponse> getCurrentLocation(@PathVariable Long id) {
        return ResponseEntity.ok(liveTrackingService.getCurrentLocation(id));
    }

    @GetMapping("/{id}/location-history")
    public ResponseEntity<List<ShipmentLocationResponse>> getLocationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(liveTrackingService.getLocationHistory(id));
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<LiveTrackingResponse> getLiveTracking(@PathVariable Long id) {
        return ResponseEntity.ok(liveTrackingService.getLiveTracking(id));
    }
}
