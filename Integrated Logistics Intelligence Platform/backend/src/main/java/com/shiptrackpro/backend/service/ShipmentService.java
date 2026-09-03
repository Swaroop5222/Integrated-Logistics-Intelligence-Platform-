package com.shiptrackpro.backend.service;

import com.shiptrackpro.backend.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.dto.UpdateShipmentRequest;
import com.shiptrackpro.backend.dto.UpdateShipmentStatusRequest;
import com.shiptrackpro.backend.entity.Shipment;
import com.shiptrackpro.backend.entity.ShipmentHistory;
import com.shiptrackpro.backend.entity.ShipmentStatus;
import com.shiptrackpro.backend.repository.ShipmentHistoryRepository;
import com.shiptrackpro.backend.repository.ShipmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentHistoryRepository historyRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentHistoryRepository historyRepository) {

        this.shipmentRepository = shipmentRepository;
        this.historyRepository = historyRepository;
    }

    public Shipment createShipment(CreateShipmentRequest request) {

        Shipment shipment = new Shipment();

        shipment.setTrackingNumber(generateTrackingNumber());
        shipment.setSenderName(request.getSenderName());
        shipment.setReceiverName(request.getReceiverName());
        shipment.setSenderAddress(request.getSenderAddress());
        shipment.setReceiverAddress(request.getReceiverAddress());
        shipment.setPackageDescription(request.getPackageDescription());
        shipment.setPackageWeight(request.getPackageWeight());

        shipment.setStatus(ShipmentStatus.CREATED);

        LocalDateTime now = LocalDateTime.now();

        shipment.setCreatedAt(now);
        shipment.setUpdatedAt(now);

        Shipment savedShipment = shipmentRepository.save(shipment);

        addHistory(
                savedShipment,
                ShipmentStatus.CREATED,
                "Shipment created"
        );

        return savedShipment;
    }

    public Shipment getShipment(Long id) {

        return shipmentRepository.findById(id)
                .orElseThrow(()
                        -> new RuntimeException("Shipment not found with id: " + id));
    }

    public Shipment getShipmentByTrackingNumber(String trackingNumber) {

        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(()
                        -> new RuntimeException(
                        "Shipment not found with tracking number: "
                        + trackingNumber));
    }

    public List<Shipment> getAllShipments() {

        return shipmentRepository.findAll();
    }

    public Shipment updateShipment(
            Long id,
            UpdateShipmentRequest request) {

        Shipment shipment = getShipment(id);

        if (shipment.getStatus() == ShipmentStatus.CANCELLED) {
            throw new RuntimeException(
                    "Cancelled shipment cannot be updated");
        }

        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {
            throw new RuntimeException(
                    "Delivered shipment cannot be updated");
        }

        shipment.setReceiverName(request.getReceiverName());
        shipment.setReceiverAddress(request.getReceiverAddress());
        shipment.setPackageDescription(request.getPackageDescription());
        shipment.setPackageWeight(request.getPackageWeight());
        shipment.setUpdatedAt(LocalDateTime.now());

        return shipmentRepository.save(shipment);
    }

    public Shipment updateStatus(
            Long id,
            UpdateShipmentStatusRequest request) {

        Shipment shipment = getShipment(id);

        ShipmentStatus currentStatus = shipment.getStatus();
        ShipmentStatus newStatus = request.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        shipment.setStatus(newStatus);
        shipment.setUpdatedAt(LocalDateTime.now());

        Shipment savedShipment = shipmentRepository.save(shipment);

        addHistory(
                savedShipment,
                newStatus,
                request.getDescription()
        );

        return savedShipment;
    }

    public Shipment cancelShipment(Long id) {

        Shipment shipment = getShipment(id);

        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {
            throw new RuntimeException(
                    "Delivered shipment cannot be cancelled");
        }

        if (shipment.getStatus() == ShipmentStatus.CANCELLED) {
            throw new RuntimeException(
                    "Shipment is already cancelled");
        }

        shipment.setStatus(ShipmentStatus.CANCELLED);
        shipment.setUpdatedAt(LocalDateTime.now());

        Shipment savedShipment = shipmentRepository.save(shipment);

        addHistory(
                savedShipment,
                ShipmentStatus.CANCELLED,
                "Shipment cancelled"
        );

        return savedShipment;
    }

    public List<ShipmentHistory> getShipmentHistory(Long id) {

        getShipment(id);

        return historyRepository
                .findByShipmentIdOrderByChangedAtAsc(id);
    }

    private void addHistory(
            Shipment shipment,
            ShipmentStatus status,
            String description) {

        ShipmentHistory history = new ShipmentHistory();

        history.setShipment(shipment);
        history.setStatus(status);
        history.setChangedAt(LocalDateTime.now());
        history.setDescription(description);

        historyRepository.save(history);
    }

    private String generateTrackingNumber() {

        return "SHP-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }

    private void validateStatusTransition(
            ShipmentStatus current,
            ShipmentStatus next) {

        if (current == ShipmentStatus.CANCELLED) {
            throw new RuntimeException(
                    "Cancelled shipment cannot change status");
        }

        if (current == ShipmentStatus.DELIVERED) {
            throw new RuntimeException(
                    "Delivered shipment cannot change status");
        }

        if (current == ShipmentStatus.CREATED
                && next != ShipmentStatus.PICKED_UP) {

            throw new RuntimeException(
                    "CREATED shipment can only move to PICKED_UP");
        }

        if (current == ShipmentStatus.PICKED_UP
                && next != ShipmentStatus.IN_TRANSIT) {

            throw new RuntimeException(
                    "PICKED_UP shipment can only move to IN_TRANSIT");
        }

        if (current == ShipmentStatus.IN_TRANSIT
                && next != ShipmentStatus.OUT_FOR_DELIVERY) {

            throw new RuntimeException(
                    "IN_TRANSIT shipment can only move to OUT_FOR_DELIVERY");
        }

        if (current == ShipmentStatus.OUT_FOR_DELIVERY
                && next != ShipmentStatus.DELIVERED
                && next != ShipmentStatus.FAILED_DELIVERY) {

            throw new RuntimeException(
                    "OUT_FOR_DELIVERY shipment can only move to "
                    + "DELIVERED or FAILED_DELIVERY");
        }

        if (current == ShipmentStatus.FAILED_DELIVERY
                && next != ShipmentStatus.OUT_FOR_DELIVERY) {

            throw new RuntimeException(
                    "FAILED_DELIVERY shipment can only move to "
                    + "OUT_FOR_DELIVERY");
        }
    }
}
