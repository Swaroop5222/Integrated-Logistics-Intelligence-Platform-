package com.shiptrack.repository;

import com.shiptrack.entity.ShipmentLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentLocationRepository extends JpaRepository<ShipmentLocation, Long> {
    Optional<ShipmentLocation> findFirstByShipmentIdOrderByRecordedAtDesc(Long shipmentId);
    List<ShipmentLocation> findByShipmentIdOrderByRecordedAtDesc(Long shipmentId);
}
