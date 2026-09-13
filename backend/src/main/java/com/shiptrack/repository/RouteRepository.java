package com.shiptrack.repository;

import com.shiptrack.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RouteRepository extends JpaRepository<Route, Long> {

    Optional<Route> findByShipmentId(Long shipmentId);

    List<Route> findByAssignedOperatorId(Long assignedOperatorId);
}
