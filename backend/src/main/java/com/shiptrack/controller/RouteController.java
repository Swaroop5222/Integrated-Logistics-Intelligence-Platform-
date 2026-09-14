package com.shiptrack.controller;

import com.shiptrack.dto.RouteResponse;
import com.shiptrack.entity.Route;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.MapsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteRepository routeRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final MapsService mapsService;

    public RouteController(
            RouteRepository routeRepository,
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            MapsService mapsService) {

        this.routeRepository = routeRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.mapsService = mapsService;
    }

    @PostMapping("/shipment/{shipmentId}/calculate")
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR')")
    public ResponseEntity<RouteResponse> calculateRoute(
            @PathVariable Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shipment not found with ID: " + shipmentId));

        User currentUser = getCurrentUser();

        // Business client can access only their own shipment.
        if (currentUser.getRole() == Role.BUSINESS_CLIENT) {
            if (shipment.getBusinessClient() == null
                    || !shipment.getBusinessClient().getId().equals(currentUser.getId())) {

                throw new org.springframework.security.access.AccessDeniedException(
                        "You can only calculate routes for your own shipments.");
            }
        }

        // Geocode sender and receiver addresses using Nominatim.
        MapsService.Coordinates origin =
                mapsService.geocode(shipment.getSenderAddress());

        MapsService.Coordinates destination =
                mapsService.geocode(shipment.getReceiverAddress());

        // Calculate route using OSRM.
        MapsService.RouteData routeData =
                mapsService.route(origin, destination);

        // Reuse existing Route if one already exists.
        Route route = routeRepository.findByShipmentId(shipmentId)
                .orElseGet(Route::new);

        route.setShipment(shipment);
        route.setAssignedOperator(shipment.getAssignedOperator());

        route.setOrigin(shipment.getSenderAddress());
        route.setDestination(shipment.getReceiverAddress());

        route.setOriginLatitude(origin.latitude());
        route.setOriginLongitude(origin.longitude());

        route.setDestinationLatitude(destination.latitude());
        route.setDestinationLongitude(destination.longitude());

        // meters -> kilometers
        BigDecimal distanceKm = BigDecimal
                .valueOf(routeData.distanceMeters() / 1000.0)
                .setScale(2, RoundingMode.HALF_UP);

        route.setDistanceKm(distanceKm);

        // seconds -> minutes
        int durationMinutes =
                (int) Math.ceil(routeData.durationSeconds() / 60.0);

        route.setEstimatedDurationMinutes(durationMinutes);

        // GeoJSON LineString returned by OSRM.
        route.setGeometry(routeData.geometry());

        Route savedRoute = routeRepository.save(route);

return ResponseEntity.ok(
        RouteResponse.from(savedRoute, routeData.geometry())
);
    }

    @GetMapping("/{id}")
   public ResponseEntity<RouteResponse> getRoute(@PathVariable Long id) {

        Route route = routeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Route not found with ID: " + id));

        return ResponseEntity.ok(RouteResponse.from(route));
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<RouteResponse> getShipmentRoute(
        @PathVariable Long shipmentId) {

        Route route = routeRepository.findByShipmentId(shipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Route not found for shipment ID: " + shipmentId));

        return ResponseEntity.ok(RouteResponse.from(route));
    }

    private User getCurrentUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Logged-in user not found with email: " + email));
    }
}
