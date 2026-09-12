package com.shiptrack.repository;

import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.enums.ShipmentStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentStatusHistoryRepository extends JpaRepository<ShipmentStatusHistory, Long> {

    List<ShipmentStatusHistory> findByShipmentIdOrderByCreatedAtAsc(Long shipmentId);

    Optional<ShipmentStatusHistory> findFirstByShipmentIdAndStatusOrderByCreatedAtDesc(Long shipmentId, ShipmentStatus status);
}
