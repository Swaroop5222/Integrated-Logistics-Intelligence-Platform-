package com.shiptrack;

import com.shiptrack.dto.DeliveryPerformanceReportResponse;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import com.shiptrack.service.DeliveryPerformanceReportService;
import com.shiptrack.service.ShipmentService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DeliveryPerformanceReportServiceTest {

    private final ShipmentService shipmentService = mock(ShipmentService.class);
    private final ShipmentStatusHistoryRepository historyRepository =
            mock(ShipmentStatusHistoryRepository.class);
    private final ProofOfDeliveryRepository proofOfDeliveryRepository =
            mock(ProofOfDeliveryRepository.class);
    private final DeliveryPerformanceReportService service =
            new DeliveryPerformanceReportService(
                    shipmentService, historyRepository, proofOfDeliveryRepository);

    @Test
    void reportsCompletedAndDelayedDeliveriesFromPersistedHistory() {
        LocalDate reportDate = LocalDate.of(2026, 10, 7);
        LocalDateTime completion = reportDate.atTime(12, 0);
        ShipmentResponse onTime = shipment(1L, ShipmentStatus.DELIVERED, completion);
        ShipmentResponse delayed = shipment(2L, ShipmentStatus.DELIVERED, completion);
        ShipmentResponse failed = shipment(3L, ShipmentStatus.FAILED_DELIVERY, completion);
        ShipmentResponse outsideRange = shipment(
                4L, ShipmentStatus.DELIVERED, reportDate.plusDays(1).atTime(12, 0));
        when(shipmentService.getAllShipments())
                .thenReturn(List.of(onTime, delayed, failed, outsideRange));
        when(historyRepository.findByShipmentIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(history(ShipmentStatus.DELIVERED, completion)));
        when(historyRepository.findByShipmentIdOrderByCreatedAtAsc(2L))
                .thenReturn(List.of(
                        history(ShipmentStatus.FAILED_DELIVERY, completion.minusHours(1)),
                        history(ShipmentStatus.DELIVERED, completion)));
        when(historyRepository.findByShipmentIdOrderByCreatedAtAsc(3L))
                .thenReturn(List.of(history(ShipmentStatus.FAILED_DELIVERY, completion)));
        when(historyRepository.findByShipmentIdOrderByCreatedAtAsc(4L))
                .thenReturn(List.of(history(
                        ShipmentStatus.DELIVERED, reportDate.plusDays(1).atTime(12, 0))));
        when(proofOfDeliveryRepository.findByShipmentId(1L)).thenReturn(Optional.empty());
        when(proofOfDeliveryRepository.findByShipmentId(2L)).thenReturn(Optional.empty());
        when(proofOfDeliveryRepository.findByShipmentId(3L)).thenReturn(Optional.empty());
        when(proofOfDeliveryRepository.findByShipmentId(4L)).thenReturn(Optional.empty());

        DeliveryPerformanceReportResponse response =
                service.getReport(reportDate, reportDate);

        assertEquals(1, response.getOnTimeDeliveries());
        assertEquals(2, response.getDelayedDeliveries());
        assertEquals(2, response.getCompletedDeliveries());
        assertEquals(3, response.getRecords().size());
    }

    private ShipmentResponse shipment(
            Long id,
            ShipmentStatus status,
            LocalDateTime updatedAt) {
        ShipmentResponse shipment = new ShipmentResponse();
        shipment.setId(id);
        shipment.setTrackingNumber("TRACK-" + id);
        shipment.setReceiverName("Receiver " + id);
        shipment.setStatus(status);
        shipment.setUpdatedAt(updatedAt);
        return shipment;
    }

    private ShipmentStatusHistory history(
            ShipmentStatus status,
            LocalDateTime createdAt) {
        ShipmentStatusHistory history = new ShipmentStatusHistory();
        history.setStatus(status);
        history.setCreatedAt(createdAt);
        return history;
    }
}
