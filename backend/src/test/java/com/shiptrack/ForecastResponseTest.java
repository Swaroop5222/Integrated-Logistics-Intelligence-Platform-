package com.shiptrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiptrack.dto.ForecastResponse;
import com.shiptrack.entity.Forecast;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.enums.ShipmentStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ForecastResponseTest {

    @Test
    void serializesForecastWithoutExposingRelatedUserAccounts() throws Exception {
        User user = new User();
        user.setEmail("private@example.com");
        user.setPasswordHash("sensitive-hash");

        Shipment shipment = new Shipment();
        shipment.setId(79L);
        shipment.setTrackingNumber("STP-2026-00021");
        shipment.setReferenceId("E2E-ACTIVE-20261005-02");
        shipment.setStatus(ShipmentStatus.DELIVERED);
        shipment.setBusinessClient(user);
        shipment.setCustomer(user);
        shipment.setAssignedOperator(user);

        Forecast forecast = new Forecast();
        forecast.setShipment(shipment);
        forecast.setConfidence(0.75);
        forecast.setPredictedStatus(ShipmentStatus.IN_TRANSIT);

        String json = new ObjectMapper()
                .writeValueAsString(ForecastResponse.from(forecast));

        assertThat(json)
                .contains("\"trackingNumber\":\"STP-2026-00021\"")
                .contains("\"status\":\"DELIVERED\"")
                .doesNotContain(
                        "passwordHash",
                        "sensitive-hash",
                        "private@example.com",
                        "businessClient",
                        "assignedOperator"
                );
    }
}
