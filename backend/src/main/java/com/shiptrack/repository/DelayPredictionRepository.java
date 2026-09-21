package com.shiptrack.repository;

import com.shiptrack.entity.DelayPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DelayPredictionRepository
        extends JpaRepository<DelayPrediction, Long> {

    List<DelayPrediction> findByShipmentIdOrderByCreatedAtDesc(Long shipmentId);
}
