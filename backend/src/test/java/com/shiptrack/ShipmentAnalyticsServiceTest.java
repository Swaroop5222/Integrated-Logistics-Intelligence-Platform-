package com.shiptrack;

import com.shiptrack.dto.ShipmentAnalyticsResponse;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.service.ShipmentAnalyticsService;
import com.shiptrack.service.ShipmentService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ShipmentAnalyticsServiceTest {

    private final ShipmentService shipmentService = mock(ShipmentService.class);
    private final ShipmentAnalyticsService service =
            new ShipmentAnalyticsService(shipmentService);

    @Test
    void countsShipmentsByCurrentStatusAndFiltersByCreationDate() {
        LocalDate reportDate = LocalDate.of(2026, 10, 7);
        when(shipmentService.getAllShipments()).thenReturn(List.of(
                shipment(1L, ShipmentStatus.CREATED, reportDate.atStartOfDay()),
                shipment(2L, ShipmentStatus.PICKED_UP, reportDate.atTime(9, 0)),
                shipment(3L, ShipmentStatus.IN_TRANSIT, reportDate.atTime(10, 0)),
                shipment(4L, ShipmentStatus.OUT_FOR_DELIVERY, reportDate.atTime(11, 0)),
                shipment(5L, ShipmentStatus.DELIVERED, reportDate.atTime(12, 0)),
                shipment(6L, ShipmentStatus.FAILED_DELIVERY, reportDate.atTime(13, 0)),
                shipment(7L, ShipmentStatus.CANCELLED, reportDate.atTime(14, 0)),
                shipment(8L, ShipmentStatus.DELIVERED, reportDate.plusDays(1).atStartOfDay())
        ));

        ShipmentAnalyticsResponse response =
                service.getAnalytics(reportDate, reportDate);

        assertEquals(7, response.getTotalShipments());
        assertEquals(1, response.getDeliveredShipments());
        assertEquals(1, response.getDelayedShipments());
        assertEquals(3, response.getInTransitShipments());
        assertEquals(1, response.getCreatedShipments());
        assertEquals(1, response.getPickedUpShipments());
        assertEquals(1, response.getOutForDeliveryShipments());
        assertEquals(1, response.getCancelledShipments());
    }

    @Test
    void rejectsAnInvertedDateRange() {
        assertThrows(IllegalArgumentException.class, () ->
                service.getAnalytics(
                        LocalDate.of(2026, 10, 8),
                        LocalDate.of(2026, 10, 7)));
    }

    private ShipmentResponse shipment(
            Long id,
            ShipmentStatus status,
            LocalDateTime createdAt) {
        ShipmentResponse shipment = new ShipmentResponse();
        shipment.setId(id);
        shipment.setStatus(status);
        shipment.setCreatedAt(createdAt);
        return shipment;
    }
}
