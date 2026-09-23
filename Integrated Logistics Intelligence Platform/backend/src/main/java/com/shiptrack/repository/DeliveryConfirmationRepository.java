package com.shiptrack.repository;

import com.shiptrack.model.DeliveryConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryConfirmationRepository extends JpaRepository<DeliveryConfirmation, Long> {
    Optional<DeliveryConfirmation> findByTrackingNumber(String trackingNumber);
}
