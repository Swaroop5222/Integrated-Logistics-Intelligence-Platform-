package com.shiptrack;

import com.shiptrack.dto.ProofOfDeliveryRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.NotificationService;
import com.shiptrack.service.ProofOfDeliveryServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProofOfDeliveryServiceTest {

    private final ProofOfDeliveryRepository podRepository =
            mock(ProofOfDeliveryRepository.class);
    private final ShipmentRepository shipmentRepository =
            mock(ShipmentRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final ShipmentStatusHistoryRepository historyRepository =
            mock(ShipmentStatusHistoryRepository.class);
    private final NotificationService notificationService =
            mock(NotificationService.class);
    private final ProofOfDeliveryServiceImpl service =
            new ProofOfDeliveryServiceImpl(
                    podRepository,
                    shipmentRepository,
                    userRepository,
                    historyRepository,
                    notificationService);

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void confirmsDeliveryAndSavesVerifiedPngSignature() throws IOException {
        User operator = operator();
        Shipment shipment = shipment(operator);
        authenticate();
        when(userRepository.findByEmail("operator@shiptrack.test"))
                .thenReturn(Optional.of(operator));
        when(shipmentRepository.findById(12L)).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(podRepository.existsByShipmentId(12L)).thenReturn(false);
        when(historyRepository.save(any(ShipmentStatusHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(podRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProofOfDeliveryResponse response =
                service.createProofOfDelivery(12L, request(validPngDataUrl()));

        assertEquals(ShipmentStatus.DELIVERED, shipment.getStatus());
        assertEquals(ShipmentStatus.DELIVERED, response.getDeliveryStatus());
        assertTrue(response.isSignatureVerified());
        verify(historyRepository).save(any(ShipmentStatusHistory.class));
        verify(notificationService).notifyStatusChange(
                shipment, ShipmentStatus.DELIVERED, null);
    }

    @Test
    void rejectsMalformedSignatureBeforeChangingShipmentStatus() {
        User operator = operator();
        Shipment shipment = shipment(operator);
        authenticate();
        when(userRepository.findByEmail("operator@shiptrack.test"))
                .thenReturn(Optional.of(operator));
        when(shipmentRepository.findById(12L)).thenReturn(Optional.of(shipment));
        when(podRepository.existsByShipmentId(12L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () ->
                service.createProofOfDelivery(
                        12L, request("data:image/png;base64,not-a-png")));

        assertEquals(ShipmentStatus.OUT_FOR_DELIVERY, shipment.getStatus());
        verify(shipmentRepository, never()).save(any(Shipment.class));
        verify(podRepository, never()).save(any());
    }

    private void authenticate() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "operator@shiptrack.test", "password"));
    }

    private User operator() {
        User operator = new User();
        operator.setId(5L);
        operator.setEmail("operator@shiptrack.test");
        operator.setFullName("Test Operator");
        operator.setRole(Role.LOGISTICS_OPERATOR);
        return operator;
    }

    private Shipment shipment(User operator) {
        Shipment shipment = new Shipment();
        shipment.setId(12L);
        shipment.setTrackingNumber("STP-TEST-12");
        shipment.setReceiverName("Receiver");
        shipment.setReceiverPhone("1234567890");
        shipment.setReceiverAddress("Receiver address");
        shipment.setAssignedOperator(operator);
        shipment.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);
        return shipment;
    }

    private ProofOfDeliveryRequest request(String signature) {
        ProofOfDeliveryRequest request = new ProofOfDeliveryRequest();
        request.setDeliveryStatus(ShipmentStatus.DELIVERED);
        request.setDeliveredAt(LocalDateTime.now().minusMinutes(1));
        request.setSignature(signature);
        request.setRemarks("Left with receiver");
        return request;
    }

    private String validPngDataUrl() throws IOException {
        BufferedImage image = new BufferedImage(4, 4, BufferedImage.TYPE_INT_ARGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(output.toByteArray());
    }
}
