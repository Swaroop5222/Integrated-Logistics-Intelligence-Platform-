package com.shiptrack.repository;

import com.shiptrack.model.LiveLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveLocationRepository extends JpaRepository<LiveLocation, Long> {
    List<LiveLocation> findByDeliveryIdOrderByTimestampAsc(Long deliveryId);
}
