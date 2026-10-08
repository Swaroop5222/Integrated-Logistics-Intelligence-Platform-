package com.shiptrack.service;

import com.shiptrack.dto.ProofOfDeliveryRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.entity.ProofOfDelivery;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Iterator;
import java.time.LocalDateTime;

@Service
public class ProofOfDeliveryServiceImpl implements ProofOfDeliveryService {

    private static final String PNG_DATA_URL_PREFIX = "data:image/png;base64,";
    private static final int MAX_SIGNATURE_BYTES = 1_000_000;
    private static final int MAX_SIGNATURE_PIXELS = 4_000_000;

    private final ProofOfDeliveryRepository podRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final ShipmentStatusHistoryRepository historyRepository;
    private final NotificationService notificationService;

    public ProofOfDeliveryServiceImpl(ProofOfDeliveryRepository podRepository,
                                      ShipmentRepository shipmentRepository,
                                      UserRepository userRepository,
                                      ShipmentStatusHistoryRepository historyRepository,
                                      NotificationService notificationService) {
        this.podRepository = podRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.notificationService = notificationService;
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

        throw new AccessDeniedException("You do not have permission to view this shipment's proof of delivery.");
    }

    private void checkCreatePermission(Shipment shipment, User user) {
        if (user.getRole() == Role.ADMINISTRATOR) return;

        if (user.getRole() == Role.LOGISTICS_OPERATOR
                && shipment.getAssignedOperator() != null
                && shipment.getAssignedOperator().getId().equals(user.getId())) return;

        throw new AccessDeniedException("Only the assigned logistics operator or an administrator can create proof of delivery.");
    }

    @Override
    @Transactional
    public ProofOfDeliveryResponse createProofOfDelivery(Long shipmentId, ProofOfDeliveryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("POD request is required.");
        }

        User currentUser = getCurrentUser();
        Shipment shipment = getShipment(shipmentId);
        checkCreatePermission(shipment, currentUser);

        if (podRepository.existsByShipmentId(shipmentId)) {
            throw new IllegalArgumentException("Proof of delivery already exists for shipment ID: " + shipmentId);
        }

        if (request.getDeliveryStatus() != ShipmentStatus.DELIVERED) {
            throw new IllegalArgumentException("POD delivery status must be DELIVERED.");
        }

        validateSignature(request.getSignature());
        if (request.getRemarks() != null && request.getRemarks().length() > 1000) {
            throw new IllegalArgumentException("POD remarks cannot exceed 1000 characters.");
        }

        LocalDateTime deliveredAt = request.getDeliveredAt() == null
                ? LocalDateTime.now()
                : request.getDeliveredAt();
        if (deliveredAt.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Delivery time cannot be in the future.");
        }
        if (shipment.getStatus() == ShipmentStatus.CANCELLED) {
            throw new IllegalArgumentException("A cancelled shipment cannot be confirmed as delivered.");
        }

        if (shipment.getStatus() != ShipmentStatus.DELIVERED) {
            shipment.setStatus(ShipmentStatus.DELIVERED);
            Shipment savedShipment = shipmentRepository.save(shipment);

            ShipmentStatusHistory history = new ShipmentStatusHistory();
            history.setShipment(savedShipment);
            history.setStatus(ShipmentStatus.DELIVERED);
            history.setRemarks(normalize(request.getRemarks()) == null
                    ? "Delivery confirmed with proof of delivery."
                    : normalize(request.getRemarks()));
            history.setUpdatedBy(currentUser);
            ShipmentStatusHistory savedHistory = historyRepository.save(history);
            notificationService.notifyStatusChange(
                    savedShipment, ShipmentStatus.DELIVERED, savedHistory.getCreatedAt());
        }

        ProofOfDelivery pod = new ProofOfDelivery();
        pod.setShipment(shipment);
        pod.setReceiverName(shipment.getReceiverName());
        pod.setReceiverPhone(shipment.getReceiverPhone());
        pod.setReceiverAddress(shipment.getReceiverAddress());
        pod.setDeliveredAt(deliveredAt);
        pod.setDeliveryStatus(ShipmentStatus.DELIVERED);
        pod.setSignature(request.getSignature().trim());
        pod.setRemarks(normalize(request.getRemarks()));
        pod.setDeliveredBy(currentUser);

        return mapToResponse(podRepository.save(pod));
    }

    @Override
    @Transactional(readOnly = true)
    public ProofOfDeliveryResponse getProofOfDelivery(Long shipmentId) {
        User currentUser = getCurrentUser();
        Shipment shipment = getShipment(shipmentId);
        checkVisibility(shipment, currentUser);

        ProofOfDelivery pod = podRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Proof of delivery not found for shipment ID: " + shipmentId));

        return mapToResponse(pod);
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ProofOfDeliveryResponse mapToResponse(ProofOfDelivery pod) {
        ProofOfDeliveryResponse response = new ProofOfDeliveryResponse();
        Shipment shipment = pod.getShipment();
        User deliveredBy = pod.getDeliveredBy();

        response.setId(pod.getId());
        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setReceiverName(pod.getReceiverName());
        response.setReceiverPhone(pod.getReceiverPhone());
        response.setReceiverAddress(pod.getReceiverAddress());
        response.setDeliveredAt(pod.getDeliveredAt());
        response.setDeliveryStatus(pod.getDeliveryStatus());
        response.setSignature(pod.getSignature());
        response.setSignatureVerified(isValidSignature(pod.getSignature()));
        response.setRemarks(pod.getRemarks());
        response.setDeliveredByUserId(deliveredBy.getId());
        response.setDeliveredByUserName(deliveredBy.getFullName());
        response.setCreatedAt(pod.getCreatedAt());
        response.setUpdatedAt(pod.getUpdatedAt());
        return response;
    }

    private void validateSignature(String signature) {
        if (!isValidSignature(signature)) {
            throw new IllegalArgumentException(
                    "A valid PNG receiver signature is required.");
        }
    }

    private boolean isValidSignature(String signature) {
        if (signature == null || !signature.startsWith(PNG_DATA_URL_PREFIX)) {
            return false;
        }

        String encoded = signature.substring(PNG_DATA_URL_PREFIX.length());
        if (encoded.isBlank() || encoded.length() > ((MAX_SIGNATURE_BYTES + 2) / 3) * 4) {
            return false;
        }

        try {
            byte[] imageBytes = Base64.getDecoder().decode(encoded);
            if (imageBytes.length == 0 || imageBytes.length > MAX_SIGNATURE_BYTES
                    || !hasPngHeader(imageBytes)) {
                return false;
            }

            try (ImageInputStream input = ImageIO.createImageInputStream(
                    new ByteArrayInputStream(imageBytes))) {
                if (input == null) {
                    return false;
                }

                Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
                if (!readers.hasNext()) {
                    return false;
                }

                ImageReader reader = readers.next();
                try {
                    reader.setInput(input, true, true);
                    int width = reader.getWidth(0);
                    int height = reader.getHeight(0);
                    return width > 0 && height > 0
                            && (long) width * height <= MAX_SIGNATURE_PIXELS
                            && reader.read(0) != null;
                } finally {
                    reader.dispose();
                }
            }
        } catch (IllegalArgumentException | IOException exception) {
            return false;
        }
    }

    private boolean hasPngHeader(byte[] imageBytes) {
        byte[] pngHeader = {
                (byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
        };
        if (imageBytes.length < pngHeader.length) {
            return false;
        }
        for (int index = 0; index < pngHeader.length; index++) {
            if (imageBytes[index] != pngHeader[index]) {
                return false;
            }
        }
        return true;
    }
}
