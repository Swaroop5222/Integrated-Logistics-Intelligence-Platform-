package com.shiptrack.repository;

import com.shiptrack.model.DeliveryEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryEventRepository extends JpaRepository<DeliveryEvent, Long> {
    List<DeliveryEvent> findByDeliveryIdOrderByTimestampAsc(Long deliveryId);
}
