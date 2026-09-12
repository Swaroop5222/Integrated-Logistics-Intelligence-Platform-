package com.shiptrack.service;

import com.shiptrack.dto.GeoPoint;
import com.shiptrack.dto.RouteRequest;
import com.shiptrack.dto.RouteResponse;
import com.shiptrack.entity.Route;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RouteServiceImpl implements RouteService {
    private final RouteRepository routeRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public RouteServiceImpl(RouteRepository routeRepository, ShipmentRepository shipmentRepository,
                            UserRepository userRepository) {
        this.routeRepository = routeRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public RouteResponse saveRoute(Long shipmentId, RouteRequest request) {
        User current = currentUser();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));
        if (current.getRole() != Role.ADMINISTRATOR
                && (current.getRole() != Role.BUSINESS_CLIENT
                || shipment.getBusinessClient() == null
                || !shipment.getBusinessClient().getId().equals(current.getId()))) {
            throw new AccessDeniedException("Only the shipment business client or administrator can manage routes.");
        }
        if (request == null || blank(request.getOrigin()) || blank(request.getDestination())) {
            throw new IllegalArgumentException("Route origin and destination are required.");
        }
        validatePoint(request.getOriginCoordinates(), "origin");
        validatePoint(request.getDestinationCoordinates(), "destination");

        Route route = routeRepository.findByShipmentId(shipmentId).orElseGet(Route::new);
        route.setShipment(shipment);
        route.setOrigin(request.getOrigin());
        route.setDestination(request.getDestination());
        route.setDistanceKm(request.getDistanceKm());
        route.setEstimatedDurationMinutes(request.getEstimatedDurationHours() == null
                ? null : (int) Math.round(request.getEstimatedDurationHours() * 60));
        if (request.getAssignedOperatorId() != null) {
            User operator = userRepository.findById(request.getAssignedOperatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned operator not found."));
            if (operator.getRole() != Role.LOGISTICS_OPERATOR) {
                throw new IllegalArgumentException("Assigned user must be a logistics operator.");
            }
            route.setAssignedOperator(operator);
        } else {
            route.setAssignedOperator(shipment.getAssignedOperator());
        }
        route.setOriginLatitude(request.getOriginCoordinates().getLatitude());
        route.setOriginLongitude(request.getOriginCoordinates().getLongitude());
        route.setDestinationLatitude(request.getDestinationCoordinates().getLatitude());
        route.setDestinationLongitude(request.getDestinationCoordinates().getLongitude());
        return map(routeRepository.save(route));
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse getRoute(Long shipmentId) {
        User current = currentUser();
        Route route = routeRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found for shipment ID: " + shipmentId));
        Shipment shipment = route.getShipment();
        if (current.getRole() != Role.ADMINISTRATOR && current.getRole() != Role.SUPPORT_AGENT
                && !same(current, shipment.getBusinessClient())
                && !same(current, shipment.getCustomer())
                && !same(current, shipment.getAssignedOperator())) {
            throw new AccessDeniedException("You do not have permission to view this route.");
        }
        return map(route);
    }

    private User currentUser() {
        return userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found."));
    }

    private void validatePoint(GeoPoint point, String name) {
        if (point == null || point.getLatitude() == null || point.getLongitude() == null
                || point.getLatitude() < -90 || point.getLatitude() > 90
                || point.getLongitude() < -180 || point.getLongitude() > 180) {
            throw new IllegalArgumentException("Valid " + name + " coordinates are required.");
        }
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private boolean same(User first, User second) {
        return second != null && first.getId().equals(second.getId());
    }

    private RouteResponse map(Route route) {
        RouteResponse response = new RouteResponse();
        response.setId(route.getId());
        response.setShipmentId(route.getShipment().getId());
        response.setAssignedOperatorId(route.getAssignedOperator() == null ? null : route.getAssignedOperator().getId());
        response.setOrigin(route.getOrigin());
        response.setDestination(route.getDestination());
        response.setDistanceKm(route.getDistanceKm());
        response.setEstimatedDurationHours(route.getEstimatedDurationMinutes() == null
                ? null : route.getEstimatedDurationMinutes() / 60.0);
        response.setOriginCoordinates(new GeoPoint(route.getOriginLatitude(), route.getOriginLongitude()));
        response.setDestinationCoordinates(new GeoPoint(route.getDestinationLatitude(), route.getDestinationLongitude()));
        response.setCreatedAt(route.getCreatedAt());
        response.setUpdatedAt(route.getUpdatedAt());
        return response;
    }
}
