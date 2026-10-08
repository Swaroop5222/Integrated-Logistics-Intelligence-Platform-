package com.shiptrack.service;

import com.shiptrack.dto.DeliveryPerformanceRecord;
import com.shiptrack.dto.DeliveryPerformanceReportResponse;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.entity.ProofOfDelivery;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DeliveryPerformanceReportService {

    private static final String ON_TIME_DEFINITION =
            "A delivered shipment with no FAILED_DELIVERY status recorded in its status history.";

    private final ShipmentService shipmentService;
    private final ShipmentStatusHistoryRepository historyRepository;
    private final ProofOfDeliveryRepository proofOfDeliveryRepository;

    public DeliveryPerformanceReportService(
            ShipmentService shipmentService,
            ShipmentStatusHistoryRepository historyRepository,
            ProofOfDeliveryRepository proofOfDeliveryRepository) {
        this.shipmentService = shipmentService;
        this.historyRepository = historyRepository;
        this.proofOfDeliveryRepository = proofOfDeliveryRepository;
    }

    public DeliveryPerformanceReportResponse getReport(LocalDate fromDate, LocalDate toDate) {
        ShipmentAnalyticsService.validateDateRange(fromDate, toDate);

        List<DeliveryPerformanceRecord> records = new ArrayList<>();
        for (ShipmentResponse shipment : shipmentService.getAllShipments()) {
            if (shipment.getStatus() != ShipmentStatus.DELIVERED
                    && shipment.getStatus() != ShipmentStatus.FAILED_DELIVERY) {
                continue;
            }

            List<ShipmentStatusHistory> history =
                    historyRepository.findByShipmentIdOrderByCreatedAtAsc(shipment.getId());
            List<ShipmentStatusHistory> failedAttempts = history.stream()
                    .filter(item -> item.getStatus() == ShipmentStatus.FAILED_DELIVERY)
                    .toList();

            LocalDateTime deliveredAt = deliveredAt(shipment, history);
            LocalDateTime delayedAt = failedAttempts.stream()
                    .map(ShipmentStatusHistory::getCreatedAt)
                    .max(Comparator.naturalOrder())
                    .orElse(shipment.getStatus() == ShipmentStatus.FAILED_DELIVERY
                            ? shipment.getUpdatedAt()
                            : null);

            boolean completed = shipment.getStatus() == ShipmentStatus.DELIVERED;
            LocalDateTime reportDate = completed ? deliveredAt : delayedAt;
            if (!ShipmentAnalyticsService.isInRange(reportDate, fromDate, toDate)) {
                continue;
            }

            DeliveryPerformanceRecord record = new DeliveryPerformanceRecord();
            record.setShipmentId(shipment.getId());
            record.setTrackingNumber(shipment.getTrackingNumber());
            record.setReceiverName(shipment.getReceiverName());
            record.setStatus(shipment.getStatus());
            record.setCategory(completed
                    ? failedAttempts.isEmpty() ? "ON_TIME" : "DELAYED"
                    : "DELAYED");
            record.setCompletedAt(deliveredAt);
            record.setDelayedAt(delayedAt);
            record.setFailedDeliveryAttempts(failedAttempts.size());
            records.add(record);
        }

        long completedCount = records.stream()
                .filter(record -> record.getStatus() == ShipmentStatus.DELIVERED)
                .count();
        long delayedCount = records.stream()
                .filter(record -> "DELAYED".equals(record.getCategory()))
                .count();
        long onTimeCount = records.stream()
                .filter(record -> "ON_TIME".equals(record.getCategory()))
                .count();

        DeliveryPerformanceReportResponse response = new DeliveryPerformanceReportResponse();
        response.setFromDate(fromDate);
        response.setToDate(toDate);
        response.setOnTimeDeliveries(onTimeCount);
        response.setDelayedDeliveries(delayedCount);
        response.setCompletedDeliveries(completedCount);
        response.setOnTimeDefinition(ON_TIME_DEFINITION);
        response.setRecords(records);
        return response;
    }

    private LocalDateTime deliveredAt(
            ShipmentResponse shipment,
            List<ShipmentStatusHistory> history) {
        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipmentId(shipment.getId())
                .orElse(null);
        if (pod != null) {
            return pod.getDeliveredAt();
        }

        return history.stream()
                .filter(item -> item.getStatus() == ShipmentStatus.DELIVERED)
                .map(ShipmentStatusHistory::getCreatedAt)
                .max(Comparator.naturalOrder())
                .orElse(shipment.getUpdatedAt());
    }
}
