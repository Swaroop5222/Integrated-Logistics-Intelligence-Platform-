package com.shiptrack.service;

import com.shiptrack.dto.ShipmentRequest;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.dto.ShipmentStatusHistoryResponse;
import com.shiptrack.dto.StatusUpdateRequest;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository,
                               ShipmentStatusHistoryRepository historyRepository,
                               UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found with email: " + email));
    }

    private void checkVisibility(Shipment shipment, User user) {
        if (user.getRole() == Role.ADMINISTRATOR || user.getRole() == Role.SUPPORT_AGENT) {
            return;
        }
        if (user.getRole() == Role.BUSINESS_CLIENT && shipment.getBusinessClient().getId().equals(user.getId())) {
            return;
        }
        if (user.getRole() == Role.CUSTOMER && shipment.getCustomer() != null && shipment.getCustomer().getId().equals(user.getId())) {
            return;
        }
        if (user.getRole() == Role.LOGISTICS_OPERATOR && shipment.getAssignedOperator() != null && shipment.getAssignedOperator().getId().equals(user.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have permission to view or access this shipment.");
    }

    private synchronized String generateUniqueTrackingNumber() {
        String yearStr = String.valueOf(LocalDate.now().getYear());
        String prefix = "STP-" + yearStr + "-";
        long count = shipmentRepository.countByTrackingNumberStartingWith(prefix);
        String trackingNumber;
        long nextNum = count + 1;
        do {
            trackingNumber = prefix + String.format("%05d", nextNum);
            nextNum++;
        } while (shipmentRepository.findByTrackingNumber(trackingNumber).isPresent());
        return trackingNumber;
    }

    @Override
    @Transactional
    public ShipmentResponse createShipment(ShipmentRequest request) {
        User currentUser = getCurrentUser();
        Shipment shipment = new Shipment();

        // Resolve Business Client
        if (currentUser.getRole() == Role.BUSINESS_CLIENT) {
            shipment.setBusinessClient(currentUser);
        } else if (currentUser.getRole() == Role.ADMINISTRATOR) {
            if (request.getBusinessClientId() == null) {
                throw new IllegalArgumentException("Business client ID is required for administrators creating a shipment");
            }
            User businessClient = userRepository.findById(request.getBusinessClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Business client not found with ID: " + request.getBusinessClientId()));
            if (businessClient.getRole() != Role.BUSINESS_CLIENT) {
                throw new IllegalArgumentException("Assigned business client must have BUSINESS_CLIENT role");
            }
            shipment.setBusinessClient(businessClient);
        } else {
            throw new AccessDeniedException("Only business clients and administrators can create shipments.");
        }

        // Resolve optional Customer
        if (request.getCustomerId() != null) {
            User customer = userRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));
            if (customer.getRole() != Role.CUSTOMER) {
                throw new IllegalArgumentException("Assigned customer must have CUSTOMER role");
            }
            shipment.setCustomer(customer);
        }

        // Resolve optional Operator
        if (request.getAssignedOperatorId() != null) {
            User operator = userRepository.findById(request.getAssignedOperatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Logistics operator not found with ID: " + request.getAssignedOperatorId()));
            if (operator.getRole() != Role.LOGISTICS_OPERATOR) {
                throw new IllegalArgumentException("Assigned operator must have LOGISTICS_OPERATOR role");
            }
            shipment.setAssignedOperator(operator);
        }

        shipment.setTrackingNumber(generateUniqueTrackingNumber());
        shipment.setSenderName(request.getSenderName());
        shipment.setSenderPhone(request.getSenderPhone());
        shipment.setSenderAddress(request.getSenderAddress());
        shipment.setReceiverName(request.getReceiverName());
        shipment.setReceiverPhone(request.getReceiverPhone());
        shipment.setReceiverAddress(request.getReceiverAddress());
        shipment.setPackageDescription(request.getPackageDescription());
        shipment.setPackageWeightKg(request.getPackageWeightKg());
        shipment.setStatus(ShipmentStatus.CREATED);

        Shipment savedShipment = shipmentRepository.save(shipment);

        // Save status history entry
        ShipmentStatusHistory history = new ShipmentStatusHistory();
        history.setShipment(savedShipment);
        history.setStatus(ShipmentStatus.CREATED);
        history.setRemarks("Shipment created successfully.");
        history.setUpdatedBy(currentUser);
        historyRepository.save(history);

        return mapToResponse(savedShipment);
    }

    @Override
    public ShipmentResponse getShipmentById(Long id) {
        User currentUser = getCurrentUser();
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
        checkVisibility(shipment, currentUser);
        return mapToResponse(shipment);
    }

    @Override
    public ShipmentResponse getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with tracking number: " + trackingNumber));
        // No strict role checking here to allow public tracking lookup, or we can check visibility if required.
        // The user spec said "GET /api/shipments/track/{trackingNumber}" is for tracking.
        return mapToResponse(shipment);
    }

    @Override
    public List<ShipmentResponse> getAllShipments() {
        User currentUser = getCurrentUser();
        List<Shipment> shipments;

        if (currentUser.getRole() == Role.ADMINISTRATOR || currentUser.getRole() == Role.SUPPORT_AGENT) {
            shipments = shipmentRepository.findAll();
        } else if (currentUser.getRole() == Role.BUSINESS_CLIENT) {
            shipments = shipmentRepository.findByBusinessClientId(currentUser.getId());
        } else if (currentUser.getRole() == Role.CUSTOMER) {
            shipments = shipmentRepository.findByCustomerId(currentUser.getId());
        } else if (currentUser.getRole() == Role.LOGISTICS_OPERATOR) {
            shipments = shipmentRepository.findByAssignedOperatorId(currentUser.getId());
        } else {
            shipments = List.of();
        }

        return shipments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShipmentResponse updateShipment(Long id, ShipmentRequest request) {
        User currentUser = getCurrentUser();
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        // Validate edit rights
        if (currentUser.getRole() != Role.ADMINISTRATOR) {
            if (currentUser.getRole() != Role.BUSINESS_CLIENT || !shipment.getBusinessClient().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You do not have permission to modify this shipment.");
            }
        }

        // Resolve optional Customer
        if (request.getCustomerId() != null) {
            User customer = userRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));
            if (customer.getRole() != Role.CUSTOMER) {
                throw new IllegalArgumentException("Assigned customer must have CUSTOMER role");
            }
            shipment.setCustomer(customer);
        } else {
            shipment.setCustomer(null);
        }

        // Resolve optional Operator
        if (request.getAssignedOperatorId() != null) {
            User operator = userRepository.findById(request.getAssignedOperatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Logistics operator not found with ID: " + request.getAssignedOperatorId()));
            if (operator.getRole() != Role.LOGISTICS_OPERATOR) {
                throw new IllegalArgumentException("Assigned operator must have LOGISTICS_OPERATOR role");
            }
            shipment.setAssignedOperator(operator);
        } else {
            shipment.setAssignedOperator(null);
        }

        // Modify standard fields
        shipment.setSenderName(request.getSenderName());
        shipment.setSenderPhone(request.getSenderPhone());
        shipment.setSenderAddress(request.getSenderAddress());
        shipment.setReceiverName(request.getReceiverName());
        shipment.setReceiverPhone(request.getReceiverPhone());
        shipment.setReceiverAddress(request.getReceiverAddress());
        shipment.setPackageDescription(request.getPackageDescription());
        shipment.setPackageWeightKg(request.getPackageWeightKg());

        Shipment savedShipment = shipmentRepository.save(shipment);
        return mapToResponse(savedShipment);
    }

    @Override
    @Transactional
    public ShipmentResponse updateShipmentStatus(Long id, StatusUpdateRequest request) {
        User currentUser = getCurrentUser();
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        // Validate who can update status
        if (currentUser.getRole() == Role.LOGISTICS_OPERATOR) {
            if (shipment.getAssignedOperator() == null || !shipment.getAssignedOperator().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only update status for shipments assigned to you.");
            }
        } else if (currentUser.getRole() != Role.ADMINISTRATOR) {
            throw new AccessDeniedException("Only logistics operators and administrators can update shipment status.");
        }

        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Status value is required");
        }

        shipment.setStatus(request.getStatus());
        Shipment savedShipment = shipmentRepository.save(shipment);

        // Add history row
        ShipmentStatusHistory history = new ShipmentStatusHistory();
        history.setShipment(savedShipment);
        history.setStatus(request.getStatus());
        history.setRemarks(request.getRemarks() != null ? request.getRemarks() : "Status updated to " + request.getStatus());
        history.setUpdatedBy(currentUser);
        historyRepository.save(history);

        return mapToResponse(savedShipment);
    }

    @Override
    @Transactional
    public ShipmentResponse cancelShipment(Long id) {
        User currentUser = getCurrentUser();
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        // Validate who can cancel
        if (currentUser.getRole() != Role.ADMINISTRATOR) {
            if (currentUser.getRole() != Role.BUSINESS_CLIENT || !shipment.getBusinessClient().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You do not have permission to cancel this shipment.");
            }
        }

        shipment.setStatus(ShipmentStatus.CANCELLED);
        Shipment savedShipment = shipmentRepository.save(shipment);

        // Add history row
        ShipmentStatusHistory history = new ShipmentStatusHistory();
        history.setShipment(savedShipment);
        history.setStatus(ShipmentStatus.CANCELLED);
        history.setRemarks("Shipment cancelled.");
        history.setUpdatedBy(currentUser);
        historyRepository.save(history);

        return mapToResponse(savedShipment);
    }

    @Override
    public List<ShipmentStatusHistoryResponse> getShipmentHistory(Long id) {
        User currentUser = getCurrentUser();
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
        checkVisibility(shipment, currentUser);

        List<ShipmentStatusHistory> histories = historyRepository.findByShipmentIdOrderByCreatedAtAsc(id);
        return histories.stream().map(h -> new ShipmentStatusHistoryResponse(
                h.getId(),
                h.getShipment().getId(),
                h.getStatus(),
                h.getRemarks(),
                h.getUpdatedBy().getId(),
                h.getUpdatedBy().getFullName(),
                h.getCreatedAt()
        )).collect(Collectors.toList());
    }

    private ShipmentResponse mapToResponse(Shipment s) {
        ShipmentResponse r = new ShipmentResponse();
        r.setId(s.getId());
        r.setTrackingNumber(s.getTrackingNumber());
        r.setBusinessClientId(s.getBusinessClient().getId());
        r.setBusinessClientName(s.getBusinessClient().getFullName());
        if (s.getCustomer() != null) {
            r.setCustomerId(s.getCustomer().getId());
            r.setCustomerName(s.getCustomer().getFullName());
        }
        r.setSenderName(s.getSenderName());
        r.setSenderPhone(s.getSenderPhone());
        r.setSenderAddress(s.getSenderAddress());
        r.setReceiverName(s.getReceiverName());
        r.setReceiverPhone(s.getReceiverPhone());
        r.setReceiverAddress(s.getReceiverAddress());
        r.setPackageDescription(s.getPackageDescription());
        r.setPackageWeightKg(s.getPackageWeightKg());
        r.setStatus(s.getStatus());
        if (s.getAssignedOperator() != null) {
            r.setAssignedOperatorId(s.getAssignedOperator().getId());
            r.setAssignedOperatorName(s.getAssignedOperator().getFullName());
        }
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }
}
