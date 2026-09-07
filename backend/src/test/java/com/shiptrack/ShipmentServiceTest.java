package com.shiptrack;

import com.shiptrack.dto.*;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.ShipmentService;
import com.shiptrack.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ShipmentServiceTest {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserDetailsService userDetailsService;

    private User clientUser;
    private User customerUser;
    private User operatorUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        shipmentRepository.deleteAll();
        userRepository.deleteAll();

        // Create Users
        RegisterRequest clientReq = new RegisterRequest();
        clientReq.setFullName("Client User");
        clientReq.setEmail("client@shiptrack.com");
        clientReq.setPassword("password123");
        clientReq.setRole(Role.BUSINESS_CLIENT);
        clientReq.setPhoneNumber("1234567890");
        userService.registerUser(clientReq);
        clientUser = userRepository.findByEmail("client@shiptrack.com").orElseThrow();

        RegisterRequest customerReq = new RegisterRequest();
        customerReq.setFullName("Customer User");
        customerReq.setEmail("customer@shiptrack.com");
        customerReq.setPassword("password123");
        customerReq.setRole(Role.CUSTOMER);
        customerReq.setPhoneNumber("0987654321");
        userService.registerUser(customerReq);
        customerUser = userRepository.findByEmail("customer@shiptrack.com").orElseThrow();

        RegisterRequest operatorReq = new RegisterRequest();
        operatorReq.setFullName("Operator User");
        operatorReq.setEmail("operator@shiptrack.com");
        operatorReq.setPassword("password123");
        operatorReq.setRole(Role.LOGISTICS_OPERATOR);
        operatorReq.setPhoneNumber("1122334455");
        userService.registerUser(operatorReq);
        operatorUser = userRepository.findByEmail("operator@shiptrack.com").orElseThrow();

        RegisterRequest adminReq = new RegisterRequest();
        adminReq.setFullName("Admin User");
        adminReq.setEmail("admin@shiptrack.com");
        adminReq.setPassword("password123");
        adminReq.setRole(Role.ADMINISTRATOR);
        adminReq.setPhoneNumber("5544332211");
        userService.registerUser(adminReq);
        adminUser = userRepository.findByEmail("admin@shiptrack.com").orElseThrow();
    }

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testCreateShipment() {
        authenticateAs("client@shiptrack.com");

        ShipmentRequest request = new ShipmentRequest();
        request.setCustomerId(customerUser.getId());
        request.setAssignedOperatorId(operatorUser.getId());
        request.setSenderName("Sender Co");
        request.setSenderPhone("111-222");
        request.setSenderAddress("123 Sender St");
        request.setReceiverName("Receiver Co");
        request.setReceiverPhone("333-444");
        request.setReceiverAddress("456 Receiver Ave");
        request.setPackageDescription("Box of items");
        request.setPackageWeightKg(BigDecimal.valueOf(12.50));

        ShipmentResponse response = shipmentService.createShipment(request);

        assertNotNull(response);
        assertNotNull(response.getTrackingNumber());
        assertTrue(response.getTrackingNumber().startsWith("STP-"));
        assertEquals(ShipmentStatus.CREATED, response.getStatus());
        assertEquals(clientUser.getId(), response.getBusinessClientId());
        assertEquals(customerUser.getId(), response.getCustomerId());
        assertEquals(operatorUser.getId(), response.getAssignedOperatorId());

        // Check history
        List<ShipmentStatusHistoryResponse> history = shipmentService.getShipmentHistory(response.getId());
        assertEquals(1, history.size());
        assertEquals(ShipmentStatus.CREATED, history.get(0).getStatus());
    }

    @Test
    void testCancelShipment() {
        authenticateAs("client@shiptrack.com");

        ShipmentRequest request = new ShipmentRequest();
        request.setSenderName("Sender Co");
        request.setSenderPhone("111-222");
        request.setSenderAddress("123 Sender St");
        request.setReceiverName("Receiver Co");
        request.setReceiverPhone("333-444");
        request.setReceiverAddress("456 Receiver Ave");

        ShipmentResponse response = shipmentService.createShipment(request);
        assertEquals(ShipmentStatus.CREATED, response.getStatus());

        ShipmentResponse cancelled = shipmentService.cancelShipment(response.getId());
        assertEquals(ShipmentStatus.CANCELLED, cancelled.getStatus());

        // Check history logs
        List<ShipmentStatusHistoryResponse> history = shipmentService.getShipmentHistory(response.getId());
        assertEquals(2, history.size());
        assertEquals(ShipmentStatus.CREATED, history.get(0).getStatus());
        assertEquals(ShipmentStatus.CANCELLED, history.get(1).getStatus());
    }
}
