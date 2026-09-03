package com.shiptrackpro.backend.repository;

import com.shiptrackpro.backend.entity.ShipmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentHistoryRepository
        extends JpaRepository<ShipmentHistory, Long> {

    List<ShipmentHistory> findByShipmentIdOrderByChangedAtAsc(Long shipmentId);
}