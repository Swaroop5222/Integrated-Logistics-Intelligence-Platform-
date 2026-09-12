package com.shiptrack.service;

import com.shiptrack.dto.DelayPredictionResponse;
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
import java.time.temporal.ChronoUnit;

@Service
public class DelayPredictionServiceImpl implements DelayPredictionService {
    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public DelayPredictionServiceImpl(ShipmentRepository shipmentRepository,
                                      ShipmentStatusHistoryRepository historyRepository,
                                      UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public DelayPredictionResponse predictDelay(Long shipmentId) {
        User user = currentUser();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));
        checkVisibility(shipment, user);

        DelayPredictionResponse response = baseResponse(shipment);
        if (shipment.getExpectedDeliveryDate() == null) {
            response.setRiskLevel("UNKNOWN");
            response.setPredictionMethod("Rule-based shipment lifecycle prediction");
            response.setMessage("Expected delivery date is not configured.");
            return response;
        }
        if (shipment.getStatus() == ShipmentStatus.CANCELLED) {
            response.setRiskLevel("NOT_APPLICABLE");
            response.setPredictionMethod("Rule-based shipment lifecycle prediction");
            response.setMessage("Cancelled shipments are excluded from delay prediction.");
            return response;
        }

        LocalDate today = LocalDate.now();
        long daysUntilDue = ChronoUnit.DAYS.between(today, shipment.getExpectedDeliveryDate());
        int score = baseScore(shipment.getStatus());
        if (daysUntilDue < 0) score += 50;
        else if (daysUntilDue == 0) score += 25;
        else if (daysUntilDue <= 1 && shipment.getStatus() == ShipmentStatus.CREATED) score += 20;
        else if (daysUntilDue <= 3 && shipment.getStatus() == ShipmentStatus.CREATED) score += 10;
        score = Math.min(100, score);

        String risk = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
        long delayMinutes = "HIGH".equals(risk) ? Math.max(120, Math.max(0, -daysUntilDue) * 1440)
                : "MEDIUM".equals(risk) ? 30 : 0;
        response.setRiskScore(score);
        response.setRiskLevel(risk);
        response.setPredictedDelayHours(delayMinutes / 60.0);
        response.setPredictedDeliveryDate(shipment.getExpectedDeliveryDate()
                .plusDays(delayMinutes / 1440));
        response.setPredictionMethod("Rule-based shipment lifecycle prediction");
        response.setMessage(message(risk, daysUntilDue));

        response.setAlertCreated(false);
        return response;
    }

    private int baseScore(ShipmentStatus status) {
        return switch (status) {
            case CREATED -> 60;
            case PICKED_UP -> 35;
            case IN_TRANSIT -> 20;
            case OUT_FOR_DELIVERY -> 10;
            case DELIVERED, FAILED_DELIVERY, CANCELLED -> 0;
        };
    }

    private DelayPredictionResponse baseResponse(Shipment shipment) {
        DelayPredictionResponse response = new DelayPredictionResponse();
        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setStatus(shipment.getStatus());
        response.setExpectedDeliveryDate(shipment.getExpectedDeliveryDate());
        return response;
    }

    private String message(String risk, long daysUntilDue) {
        if (daysUntilDue < 0) return "The scheduled delivery date has passed while the shipment remains active.";
        return switch (risk) {
            case "HIGH" -> "High risk: intervention is recommended.";
            case "MEDIUM" -> "Medium risk: monitor the shipment closely.";
            default -> "Low risk: the shipment currently appears on track.";
        };
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found."));
    }

    private void checkVisibility(Shipment shipment, User user) {
        if (user.getRole() == Role.ADMINISTRATOR || user.getRole() == Role.SUPPORT_AGENT) return;
        if (user.getRole() == Role.BUSINESS_CLIENT && same(shipment.getBusinessClient(), user)) return;
        if (user.getRole() == Role.CUSTOMER && same(shipment.getCustomer(), user)) return;
        if (user.getRole() == Role.LOGISTICS_OPERATOR && same(shipment.getAssignedOperator(), user)) return;
        throw new AccessDeniedException("You do not have permission to access this shipment.");
    }

    private boolean same(User first, User second) {
        return first != null && first.getId().equals(second.getId());
    }
}
