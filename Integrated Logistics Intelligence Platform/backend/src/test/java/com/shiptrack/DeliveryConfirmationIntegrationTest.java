package com.shiptrack;

import com.shiptrack.model.DeliveryConfirmation;
import com.shiptrack.service.DeliveryConfirmationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DeliveryConfirmationIntegrationTest {

    @Autowired
    private DeliveryConfirmationService deliveryConfirmationService;

    @Test
    void shouldSaveAndFetchDeliveryConfirmation() {
        DeliveryConfirmation confirmation = new DeliveryConfirmation();
        confirmation.setTrackingNumber("TRK-1001");
        confirmation.setRecipientName("Asha Kumar");
        confirmation.setDeliveryAddress("22 Lakeview Avenue, Chennai");
        confirmation.setConfirmationMethod("OTP");
        confirmation.setDeliveryStatus("DELIVERED");
        confirmation.setDeliveryNotes("Recipient verified identity and accepted the package.");

        DeliveryConfirmation saved = deliveryConfirmationService.saveConfirmation(confirmation);

        assertNotNull(saved.getId());
        assertEquals("TRK-1001", saved.getTrackingNumber());

        var fetched = deliveryConfirmationService.getConfirmationByTrackingNumber("TRK-1001");
        assertTrue(fetched.isPresent());
        assertEquals("Asha Kumar", fetched.get().getRecipientName());
        assertFalse(deliveryConfirmationService.getAllConfirmations().isEmpty());
    }
}
