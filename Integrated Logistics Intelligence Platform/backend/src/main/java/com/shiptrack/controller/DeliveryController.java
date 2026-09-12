package com.shiptrack.controller;

import com.shiptrack.model.Delivery;
import com.shiptrack.model.DeliveryEvent;
import com.shiptrack.model.DeliveryStatus;
import com.shiptrack.model.LiveLocation;
import com.shiptrack.service.DeliveryService;
import com.shiptrack.service.LiveDeliveryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {
    private final DeliveryService deliveryService;
    private final LiveDeliveryService liveDeliveryService;

    public DeliveryController(DeliveryService deliveryService, LiveDeliveryService liveDeliveryService) {
        this.deliveryService = deliveryService;
        this.liveDeliveryService = liveDeliveryService;
    }

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@RequestBody Delivery d) {
        Delivery created = deliveryService.createDelivery(d);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Delivery>> listAll() {
        return ResponseEntity.ok(deliveryService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> get(@PathVariable Long id) {
        return deliveryService.getDelivery(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(@PathVariable Long id,
                                                 @RequestParam DeliveryStatus status,
                                                 @RequestParam(required = false) String note) {
        Delivery updated = deliveryService.updateStatus(id, status, note);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<DeliveryEvent>> events(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getEvents(id));
    }

    @PostMapping("/{id}/locations")
    public ResponseEntity<LiveLocation> addLocation(@PathVariable Long id, @RequestBody LiveLocation location) {
        LiveLocation loc = deliveryService.addLocation(id, location);
        liveDeliveryService.publishLocation(id, loc);
        return ResponseEntity.ok(loc);
    }

    @GetMapping("/{id}/locations")
    public ResponseEntity<List<LiveLocation>> locations(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getLocations(id));
    }

    @GetMapping(path = "/{id}/stream-locations", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLocations(@PathVariable Long id) {
        return liveDeliveryService.register(id);
    }
}
