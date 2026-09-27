package com.shiptrack.repository;

import com.shiptrack.entity.DeliverySignature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliverySignatureRepository
        extends JpaRepository<DeliverySignature, Long> {

    Optional<DeliverySignature> findByDeliveryId(Long deliveryId);

    boolean existsByDeliveryId(Long deliveryId);
}
