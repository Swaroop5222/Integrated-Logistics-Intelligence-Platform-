package com.shiptrack.service;

import com.shiptrack.dto.NotificationResponse;
import com.shiptrack.entity.Notification;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.entity.User;
import com.shiptrack.enums.NotificationType;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.NotificationRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               ShipmentRepository shipmentRepository,
                               ShipmentStatusHistoryRepository historyRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.shipmentRepository = shipmentRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyStatusChange(Shipment shipment, ShipmentStatus status,
                                   LocalDateTime occurredAt) {
        Map<Long, User> recipients = new LinkedHashMap<>();
        addRecipient(recipients, shipment.getBusinessClient());
        addRecipient(recipients, shipment.getCustomer());
        addRecipient(recipients, shipment.getAssignedOperator());

        recipients.values().forEach(user ->
                notificationRepository.save(
                        createNotification(user, shipment, status, occurredAt)));
    }

    @Transactional
    public List<NotificationResponse> getCurrentUserNotifications() {
        User user = getCurrentUser();

        for (Shipment shipment : getVisibleShipments(user)) {
            if (notificationRepository.existsByUserIdAndShipmentId(user.getId(), shipment.getId())) {
                continue;
            }

            List<ShipmentStatusHistory> history =
                    historyRepository.findByShipmentIdOrderByCreatedAtAsc(shipment.getId());

            if (history.isEmpty()) {
                notificationRepository.save(
                        createNotification(user, shipment, shipment.getStatus(),
                                shipment.getUpdatedAt()));
                continue;
            }

            history.forEach(entry ->
                    notificationRepository.save(
                            createNotification(user, shipment, entry.getStatus(),
                                    entry.getCreatedAt())));
        }

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own notifications.");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unread.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Logged-in user not found with email: " + email));
    }

    private List<Shipment> getVisibleShipments(User user) {
        return switch (user.getRole()) {
            case ADMINISTRATOR, SUPPORT_AGENT -> shipmentRepository.findAll();
            case BUSINESS_CLIENT -> shipmentRepository.findByBusinessClientId(user.getId());
            case CUSTOMER -> shipmentRepository.findByCustomerId(user.getId());
            case LOGISTICS_OPERATOR -> shipmentRepository.findByAssignedOperatorId(user.getId());
        };
    }

    private void addRecipient(Map<Long, User> recipients, User user) {
        if (user != null) {
            recipients.put(user.getId(), user);
        }
    }

    private Notification createNotification(User user, Shipment shipment, ShipmentStatus status,
                                            LocalDateTime occurredAt) {
        String formattedStatus = formatStatus(status);
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setShipment(shipment);
        notification.setType(status == ShipmentStatus.CREATED
                ? NotificationType.SHIPMENT_CREATED
                : status == ShipmentStatus.FAILED_DELIVERY || status == ShipmentStatus.CANCELLED
                    ? NotificationType.DELIVERY_ALERT
                    : NotificationType.STATUS_UPDATE);
        notification.setTitle(switch (status) {
            case CREATED -> "Shipment created";
            case DELIVERED -> "Shipment delivered";
            case FAILED_DELIVERY -> "Delivery failed";
            case CANCELLED -> "Shipment cancelled";
            default -> "Shipment " + formattedStatus.toLowerCase(Locale.ROOT);
        });
        notification.setMessage(
                shipment.getTrackingNumber() + " is " + formattedStatus + ".");
        notification.setCreatedAt(occurredAt);
        return notification;
    }

    private String formatStatus(ShipmentStatus status) {
        String[] words = status.name().toLowerCase(Locale.ROOT).split("_");
        List<String> formatted = new ArrayList<>(words.length);
        for (String word : words) {
            formatted.add(Character.toUpperCase(word.charAt(0)) + word.substring(1));
        }
        return String.join(" ", formatted);
    }

    private NotificationResponse toResponse(Notification notification) {
        Shipment shipment = notification.getShipment();
        return new NotificationResponse(
                notification.getId(),
                shipment == null ? null : shipment.getId(),
                shipment == null ? null : shipment.getTrackingNumber(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
