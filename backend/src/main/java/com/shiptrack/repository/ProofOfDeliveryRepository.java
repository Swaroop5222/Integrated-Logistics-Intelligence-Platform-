package com.shiptrack.repository;

import com.shiptrack.entity.ProofOfDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProofOfDeliveryRepository extends JpaRepository<ProofOfDelivery, Long> {
    Optional<ProofOfDelivery> findByShipmentId(Long shipmentId);
    boolean existsByShipmentId(Long shipmentId);
}
