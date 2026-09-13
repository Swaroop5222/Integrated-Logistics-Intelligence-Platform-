package com.shiptrack.service;

import com.shiptrack.dto.LiveTrackingResponse;
import com.shiptrack.dto.LocationUpdateRequest;
import com.shiptrack.dto.ShipmentLocationResponse;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentLocation;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ShipmentLocationRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LiveTrackingServiceImpl implements LiveTrackingService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentLocationRepository locationRepository;
    private final UserRepository userRepository;

    public LiveTrackingServiceImpl(ShipmentRepository shipmentRepository,
                                   ShipmentLocationRepository locationRepository,
                                   UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found with email: " + email));
    }

    private Shipment getShipment(Long shipmentId) {
        return shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));
    }

    private void checkVisibility(Shipment shipment, User user) {
        if (user.getRole() == Role.ADMINISTRATOR || user.getRole() == Role.SUPPORT_AGENT) return;

        if (user.getRole() == Role.BUSINESS_CLIENT
                && shipment.getBusinessClient() != null
                && shipment.getBusinessClient().getId().equals(user.getId())) return;

        if (user.getRole() == Role.CUSTOMER
                && shipment.getCustomer() != null
                && shipment.getCustomer().getId().equals(user.getId())) return;

        if (user.getRole() == Role.LOGISTICS_OPERATOR
                && shipment.getAssignedOperator() != null
                && shipment.getAssignedOperator().getId().equals(user.getId())) return;

        throw new AccessDeniedException("You do not have permission to view or access this shipment.");
    }

    private void checkLocationUpdatePermission(Shipment shipment, User user) {
        if (user.getRole() == Role.ADMINISTRATOR) return;

        if (user.getRole() != Role.LOGISTICS_OPERATOR) {
            throw new AccessDeniedException("Only the assigned logistics operator or an administrator can update shipment location.");
        }

        if (shipment.getAssignedOperator() == null
                || !shipment.getAssignedOperator().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update location for shipments assigned to you.");
        }
    }

    private void validateCoordinates(LocationUpdateRequest request) {
        if (request == null) throw new IllegalArgumentException("Location request is required.");
        if (request.getLatitude() == null) throw new IllegalArgumentException("Latitude is required.");
        if (request.getLongitude() == null) throw new IllegalArgumentException("Longitude is required.");
        if (request.getLatitude() < -90.0 || request.getLatitude() > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90.");
        }
        if (request.getLongitude() < -180.0 || request.getLongitude() > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180.");
        }
    }

    private void validateShipmentCanReceiveLocation(Shipment shipment) {
        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {
            throw new IllegalArgumentException("Location cannot be updated for a delivered shipment.");
        }
        if (shipment.getStatus() == ShipmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Location cannot be updated for a cancelled shipment.");
        }
    }

    @Override
    @Transactional
    public ShipmentLocationResponse updateLocation(Long shipmentId, LocationUpdateRequest request) {
        User currentUser = getCurrentUser();
        Shipment shipment = getShipment(shipmentId);

        checkLocationUpdatePermission(shipment, currentUser);
        validateShipmentCanReceiveLocation(shipment);
        validateCoordinates(request);

        ShipmentLocation location = new ShipmentLocation();
        location.setShipment(shipment);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setLocationName(normalizeLocationName(request.getLocationName()));
        location.setRecordedByOperator(
                currentUser.getRole() == Role.LOGISTICS_OPERATOR
                        ? currentUser
                        : shipment.getAssignedOperator()
        );

        return mapLocation(locationRepository.save(location));
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentLocationResponse getCurrentLocation(Long shipmentId) {
        User currentUser = getCurrentUser();
        Shipment shipment = getShipment(shipmentId);
        checkVisibility(shipment, currentUser);

        ShipmentLocation location = locationRepository.findFirstByShipmentIdOrderByRecordedAtDesc(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No live location has been recorded for shipment ID: " + shipmentId));
        return mapLocation(location);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentLocationResponse> getLocationHistory(Long shipmentId) {
        User currentUser = getCurrentUser();
        Shipment shipment = getShipment(shipmentId);
        checkVisibility(shipment, currentUser);

        return locationRepository.findByShipmentIdOrderByRecordedAtDesc(shipmentId)
                .stream().map(this::mapLocation).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LiveTrackingResponse getLiveTracking(Long shipmentId) {
        User currentUser = getCurrentUser();
        Shipment shipment = getShipment(shipmentId);
        checkVisibility(shipment, currentUser);

        LiveTrackingResponse response = new LiveTrackingResponse();
        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setStatus(shipment.getStatus());
        response.setSenderAddress(shipment.getSenderAddress());
        response.setReceiverAddress(shipment.getReceiverAddress());

        if (shipment.getAssignedOperator() != null) {
            response.setAssignedOperatorId(shipment.getAssignedOperator().getId());
            response.setAssignedOperatorName(shipment.getAssignedOperator().getFullName());
        }

        response.setCurrentLocation(locationRepository.findFirstByShipmentIdOrderByRecordedAtDesc(shipmentId)
                .map(this::mapLocation).orElse(null));

        response.setLocationHistory(locationRepository.findByShipmentIdOrderByRecordedAtDesc(shipmentId)
                .stream().map(this::mapLocation).collect(Collectors.toList()));

        return response;
    }

    private String normalizeLocationName(String locationName) {
        if (locationName == null) return null;
        String trimmed = locationName.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ShipmentLocationResponse mapLocation(ShipmentLocation location) {
        User operator = location.getRecordedByOperator();
        return new ShipmentLocationResponse(
                location.getId(),
                location.getLatitude(),
                location.getLongitude(),
                location.getLocationName(),
                operator != null ? operator.getId() : null,
                operator != null ? operator.getFullName() : null,
                location.getRecordedAt()
        );
    }
}
