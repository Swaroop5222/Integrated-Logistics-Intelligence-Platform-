package com.shiptrack.repository;

import com.shiptrack.entity.Shipment;
import com.shiptrack.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    List<Shipment> findByBusinessClientId(Long businessClientId);

    List<Shipment> findByCustomerId(Long customerId);

    List<Shipment> findByAssignedOperatorId(Long assignedOperatorId);

    long countByTrackingNumberStartingWith(String prefix);

    @Query("""
            select s.id as id,
                   s.trackingNumber as trackingNumber,
                   s.status as status,
                   s.createdAt as createdAt,
                   s.updatedAt as updatedAt,
                   r.estimatedDurationMinutes as estimatedDurationMinutes,
                   r.updatedAt as routeUpdatedAt,
                   pod.deliveredAt as deliveredAt
            from Shipment s
            left join Route r on r.shipment.id = s.id
            left join ProofOfDelivery pod on pod.shipment.id = s.id
            where (:businessClientId is null or s.businessClient.id = :businessClientId)
              and (:operatorId is null or s.assignedOperator.id = :operatorId)
              and s.createdAt >= :fromDate
              and s.createdAt < :toDate
            """)
    List<ShipmentAnalyticsProjection> findAnalyticsRows(
            @Param("businessClientId") Long businessClientId,
            @Param("operatorId") Long operatorId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("""
            select s.id as id,
                   s.trackingNumber as trackingNumber,
                   s.status as status,
                   s.createdAt as createdAt,
                   s.updatedAt as updatedAt,
                   r.estimatedDurationMinutes as estimatedDurationMinutes,
                   r.updatedAt as routeUpdatedAt,
                   pod.deliveredAt as deliveredAt
            from Shipment s
            left join Route r on r.shipment.id = s.id
            left join ProofOfDelivery pod on pod.shipment.id = s.id
            where s.status = :deliveredStatus
              and (:businessClientId is null or s.businessClient.id = :businessClientId)
              and (:operatorId is null or s.assignedOperator.id = :operatorId)
              and coalesce(pod.deliveredAt, s.updatedAt) >= :fromDate
              and coalesce(pod.deliveredAt, s.updatedAt) < :toDate
            order by coalesce(pod.deliveredAt, s.updatedAt) desc
            """)
    List<ShipmentAnalyticsProjection> findDeliveredRowsForReport(
            @Param("deliveredStatus") ShipmentStatus deliveredStatus,
            @Param("businessClientId") Long businessClientId,
            @Param("operatorId") Long operatorId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);
}
