package com.shiptrack.repository;

import com.shiptrack.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    List<Shipment> findByBusinessClientId(Long businessClientId);

    List<Shipment> findByCustomerId(Long customerId);

    List<Shipment> findByAssignedOperatorId(Long assignedOperatorId);

    long countByTrackingNumberStartingWith(String prefix);
}
