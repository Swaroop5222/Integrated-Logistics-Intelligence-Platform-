package com.shiptrack.service;

import com.shiptrack.model.DeliveryConfirmation;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryConfirmationService {

    private final DeliveryConfirmationRepository deliveryConfirmationRepository;

    public DeliveryConfirmationService(DeliveryConfirmationRepository deliveryConfirmationRepository) {
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
    }

    @Transactional
    public DeliveryConfirmation saveConfirmation(DeliveryConfirmation confirmation) {
        if (confirmation == null) {
            throw new IllegalArgumentException("Delivery confirmation cannot be null");
        }

        if (confirmation.getTrackingNumber() == null || confirmation.getTrackingNumber().isBlank()) {
            throw new IllegalArgumentException("Tracking number is required");
        }

        if (confirmation.getRecipientName() == null || confirmation.getRecipientName().isBlank()) {
            throw new IllegalArgumentException("Recipient name is required");
        }

        if (confirmation.getDeliveryAddress() == null || confirmation.getDeliveryAddress().isBlank()) {
            throw new IllegalArgumentException("Delivery address is required");
        }

        if (confirmation.getConfirmationTime() == null) {
            confirmation.setConfirmationTime(LocalDateTime.now());
        }

        if (confirmation.getDeliveryStatus() == null || confirmation.getDeliveryStatus().isBlank()) {
            confirmation.setDeliveryStatus("DELIVERED");
        }

        if (confirmation.getConfirmationMethod() == null || confirmation.getConfirmationMethod().isBlank()) {
            confirmation.setConfirmationMethod("SIGNATURE");
        }

        return deliveryConfirmationRepository.save(confirmation);
    }

    public List<DeliveryConfirmation> getAllConfirmations() {
        return deliveryConfirmationRepository.findAll();
    }

    public Optional<DeliveryConfirmation> getConfirmationById(Long id) {
        return deliveryConfirmationRepository.findById(id);
    }

    public Optional<DeliveryConfirmation> getConfirmationByTrackingNumber(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) {
            return Optional.empty();
        }
        return deliveryConfirmationRepository.findByTrackingNumber(trackingNumber);
    }
}
