package com.shiptrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiptrack.entity.Route;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatusHistory;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.security.JwtUtils;
import com.shiptrack.service.MapsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ShipmentReportingApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private ShipmentStatusHistoryRepository historyRepository;

    @Autowired
    private ProofOfDeliveryRepository proofOfDeliveryRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @MockitoBean
    private MapsService mapsService;

    @Test
    void analyticsReportsAndPodConfirmationUsePersistedShipmentData() throws Exception {
        User businessClient = user("analytics-business", Role.BUSINESS_CLIENT);
        User operator = user("analytics-operator", Role.LOGISTICS_OPERATOR);
        User admin = user("analytics-admin", Role.ADMINISTRATOR);
        String bearerToken = "Bearer " + jwtUtils.generateToken(
                operator.getId(), operator.getEmail(), operator.getRole().name());
        String adminToken = "Bearer " + jwtUtils.generateToken(
                admin.getId(), admin.getEmail(), admin.getRole().name());

        mockMvc.perform(get("/api/users")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists());

        mockMvc.perform(get("/api/users")
                        .header("Authorization", bearerToken))
                .andExpect(status().isForbidden());

        Shipment activeShipment = shipment(
                businessClient, operator, ShipmentStatus.OUT_FOR_DELIVERY);
        Shipment deliveredShipment = shipment(
                businessClient, operator, ShipmentStatus.DELIVERED);
        history(deliveredShipment, operator, ShipmentStatus.DELIVERED);
        shipmentRepository.flush();

        String date = LocalDate.now().toString();
        mockMvc.perform(get("/api/analytics")
                        .param("from", date)
                        .param("to", date)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalShipments").value(2))
                .andExpect(jsonPath("$.deliveredShipments").value(1))
                .andExpect(jsonPath("$.inTransitShipments").value(1));

        mockMvc.perform(get("/api/reports/performance")
                        .param("from", date)
                        .param("to", date)
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedDeliveries").value(1))
                .andExpect(jsonPath("$.onTimeDeliveries").value(1))
                .andExpect(jsonPath("$.records[0].trackingNumber")
                        .value(deliveredShipment.getTrackingNumber()));

        mockMvc.perform(get("/api/analytics")
                        .param("from", "2026-10-08")
                        .param("to", "2026-10-07")
                        .header("Authorization", bearerToken))
                .andExpect(status().isBadRequest());

        Map<String, Object> invalidPod = podRequest("data:image/png;base64,invalid");
        mockMvc.perform(post("/api/shipments/{id}/pod", activeShipment.getId())
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPod)))
                .andExpect(status().isBadRequest());
        org.junit.jupiter.api.Assertions.assertEquals(
                ShipmentStatus.OUT_FOR_DELIVERY,
                shipmentRepository.findById(activeShipment.getId()).orElseThrow().getStatus());

        mockMvc.perform(post("/api/shipments/{id}/pod", activeShipment.getId())
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                podRequest(validPngDataUrl()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deliveryStatus").value("DELIVERED"))
                .andExpect(jsonPath("$.signatureVerified").value(true))
                .andExpect(jsonPath("$.trackingNumber")
                        .value(activeShipment.getTrackingNumber()));

        org.junit.jupiter.api.Assertions.assertEquals(
                ShipmentStatus.DELIVERED,
                shipmentRepository.findById(activeShipment.getId()).orElseThrow().getStatus());
        org.junit.jupiter.api.Assertions.assertTrue(
                proofOfDeliveryRepository.existsByShipmentId(activeShipment.getId()));
    }

    @Test
    void assignedOperatorCanReadPersistedRouteGeometryOnlyForAssignedShipment()
            throws Exception {
        User businessClient = user("route-business", Role.BUSINESS_CLIENT);
        User assignedOperator = user("route-assigned-operator", Role.LOGISTICS_OPERATOR);
        User otherOperator = user("route-other-operator", Role.LOGISTICS_OPERATOR);
        Shipment assignedShipment = shipment(
                businessClient, assignedOperator, ShipmentStatus.IN_TRANSIT);
        Shipment otherShipment = shipment(
                businessClient, otherOperator, ShipmentStatus.IN_TRANSIT);
        Shipment withoutRoute = shipment(
                businessClient, assignedOperator, ShipmentStatus.CREATED);
        String persistedGeometry =
                "{\"type\":\"LineString\",\"coordinates\":[[78.4867,17.3850],[78.4875,17.3860]]}";
        routeRepository.saveAndFlush(route(assignedShipment, assignedOperator, persistedGeometry));
        routeRepository.saveAndFlush(route(otherShipment, otherOperator, persistedGeometry));

        String assignedToken = "Bearer " + jwtUtils.generateToken(
                assignedOperator.getId(),
                assignedOperator.getEmail(),
                assignedOperator.getRole().name());
        String otherToken = "Bearer " + jwtUtils.generateToken(
                otherOperator.getId(),
                otherOperator.getEmail(),
                otherOperator.getRole().name());

        mockMvc.perform(get("/api/routes/shipment/{shipmentId}", assignedShipment.getId())
                        .header("Authorization", assignedToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentId").value(assignedShipment.getId()))
                .andExpect(jsonPath("$.geometry").value(persistedGeometry));

        mockMvc.perform(get("/api/routes/shipment/{shipmentId}", assignedShipment.getId())
                        .header("Authorization", otherToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/routes/shipment/{shipmentId}", withoutRoute.getId())
                        .header("Authorization", assignedToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void assignedOperatorCanGenerateAndPersistOsrmRouteForActiveShipment()
            throws Exception {
        User businessClient = user("route-generation-business", Role.BUSINESS_CLIENT);
        User assignedOperator = user("route-generation-operator", Role.LOGISTICS_OPERATOR);
        User otherOperator = user("route-generation-other", Role.LOGISTICS_OPERATOR);
        Shipment activeShipment = shipment(
                businessClient, assignedOperator, ShipmentStatus.IN_TRANSIT);
        Shipment unassignedShipment = shipment(
                businessClient, otherOperator, ShipmentStatus.IN_TRANSIT);
        Shipment inactiveShipment = shipment(
                businessClient, assignedOperator, ShipmentStatus.CREATED);
        String persistedGeometry =
                "{\"type\":\"LineString\",\"coordinates\":[[78.4867,17.3850],[78.4875,17.3860]]}";
        when(mapsService.geocode("Test origin"))
                .thenReturn(new MapsService.Coordinates(17.3850, 78.4867));
        when(mapsService.geocode("Test destination"))
                .thenReturn(new MapsService.Coordinates(17.3860, 78.4875));
        when(mapsService.route(
                new MapsService.Coordinates(17.3850, 78.4867),
                new MapsService.Coordinates(17.3860, 78.4875)))
                .thenReturn(new MapsService.RouteData(1200, 90, persistedGeometry));

        String assignedToken = "Bearer " + jwtUtils.generateToken(
                assignedOperator.getId(),
                assignedOperator.getEmail(),
                assignedOperator.getRole().name());

        mockMvc.perform(post("/api/routes/shipment/{shipmentId}/calculate",
                        activeShipment.getId())
                        .header("Authorization", assignedToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentId").value(activeShipment.getId()))
                .andExpect(jsonPath("$.geometry").value(persistedGeometry));

        org.junit.jupiter.api.Assertions.assertEquals(
                persistedGeometry,
                routeRepository.findByShipmentId(activeShipment.getId())
                        .orElseThrow()
                        .getGeometry());

        mockMvc.perform(post("/api/routes/shipment/{shipmentId}/calculate",
                        unassignedShipment.getId())
                        .header("Authorization", assignedToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/routes/shipment/{shipmentId}/calculate",
                        inactiveShipment.getId())
                        .header("Authorization", assignedToken))
                .andExpect(status().isForbidden());
    }

    private User user(String prefix, Role role) {
        User user = new User();
        user.setFullName(prefix);
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@shiptrack.test");
        user.setPasswordHash("test-password-hash");
        user.setRole(role);
        return userRepository.saveAndFlush(user);
    }

    private Shipment shipment(
            User businessClient,
            User operator,
            ShipmentStatus status) {
        Shipment shipment = new Shipment();
        shipment.setTrackingNumber("STP-TEST-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        shipment.setBusinessClient(businessClient);
        shipment.setAssignedOperator(operator);
        shipment.setSenderName("Test Sender");
        shipment.setSenderPhone("1111111111");
        shipment.setSenderAddress("Test origin");
        shipment.setReceiverName("Test Receiver");
        shipment.setReceiverPhone("2222222222");
        shipment.setReceiverAddress("Test destination");
        shipment.setStatus(status);
        return shipmentRepository.saveAndFlush(shipment);
    }

    private Route route(
            Shipment shipment,
            User operator,
            String geometry) {
        Route route = new Route();
        route.setShipment(shipment);
        route.setAssignedOperator(operator);
        route.setOrigin(shipment.getSenderAddress());
        route.setDestination(shipment.getReceiverAddress());
        route.setOriginLatitude(17.3850);
        route.setOriginLongitude(78.4867);
        route.setDestinationLatitude(17.3860);
        route.setDestinationLongitude(78.4875);
        route.setGeometry(geometry);
        return route;
    }

    private void history(
            Shipment shipment,
            User operator,
            ShipmentStatus status) {
        ShipmentStatusHistory history = new ShipmentStatusHistory();
        history.setShipment(shipment);
        history.setUpdatedBy(operator);
        history.setStatus(status);
        history.setRemarks("Integration test delivery record");
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.saveAndFlush(history);
    }

    private Map<String, Object> podRequest(String signature) {
        return Map.of(
                "deliveredAt", LocalDateTime.now().minusMinutes(1).toString(),
                "deliveryStatus", "DELIVERED",
                "signature", signature,
                "remarks", "Integration test confirmation");
    }

    private String validPngDataUrl() throws Exception {
        BufferedImage image = new BufferedImage(8, 8, BufferedImage.TYPE_INT_ARGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(output.toByteArray());
    }
}
