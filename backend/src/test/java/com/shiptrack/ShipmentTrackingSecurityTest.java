package com.shiptrack;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ForecastRepository;
import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.ShipmentRequest;
import com.shiptrack.dto.ShipmentResponse;
import com.shiptrack.enums.Role;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.ShipmentService;
import com.shiptrack.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;
import com.shiptrack.repository.RouteRepository;
import com.shiptrack.repository.ShipmentLocationRepository;
import com.shiptrack.repository.ShipmentStatusHistoryRepository;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ShipmentTrackingSecurityTest {
@Autowired
private RouteRepository routeRepository;

@Autowired
private ShipmentLocationRepository shipmentLocationRepository;

@Autowired
private ShipmentStatusHistoryRepository shipmentStatusHistoryRepository;
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

    @Autowired
private ProofOfDeliveryRepository proofOfDeliveryRepository;

    @Autowired
    private ForecastRepository forecastRepository;

@BeforeEach
void setUp() {
    proofOfDeliveryRepository.deleteAll();
    forecastRepository.deleteAll();
    routeRepository.deleteAll();
    shipmentStatusHistoryRepository.deleteAll();
    shipmentLocationRepository.deleteAll();
    shipmentRepository.deleteAll();
    userRepository.deleteAll();

    RegisterRequest ownerReq = new RegisterRequest();
    ownerReq.setFullName("Owner Business");
    ownerReq.setEmail("owner-business@shiptrack.com");
    ownerReq.setPassword("password123");
    ownerReq.setRole(Role.BUSINESS_CLIENT);
    ownerReq.setPhoneNumber("1111111111");

    userService.registerUser(ownerReq);

    userRepository
            .findByEmail("owner-business@shiptrack.com")
            .orElseThrow();

    RegisterRequest otherReq = new RegisterRequest();
    otherReq.setFullName("Other Business");
    otherReq.setEmail("other-business@shiptrack.com");
    otherReq.setPassword("password123");
    otherReq.setRole(Role.BUSINESS_CLIENT);
    otherReq.setPhoneNumber("2222222222");

    userService.registerUser(otherReq);

    userRepository
            .findByEmail("other-business@shiptrack.com")
            .orElseThrow();
}

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private ShipmentResponse createShipmentAsOwner() {
        authenticateAs("owner-business@shiptrack.com");

        ShipmentRequest request = new ShipmentRequest();
        request.setSenderName("Sender Co");
        request.setSenderPhone("111-222");
        request.setSenderAddress("123 Sender St");
        request.setReceiverName("Receiver Co");
        request.setReceiverPhone("333-444");
        request.setReceiverAddress("456 Receiver Ave");

        return shipmentService.createShipment(request);
    }

    @Test
    void ownerCanTrackTheirOwnShipmentByTrackingNumber() {
        ShipmentResponse created = createShipmentAsOwner();

        authenticateAs("owner-business@shiptrack.com");
        ShipmentResponse tracked = shipmentService.getShipmentByTrackingNumber(created.getTrackingNumber());

        assertEquals(created.getId(), tracked.getId());
        assertEquals(created.getTrackingNumber(), tracked.getTrackingNumber());
    }

    @Test
    void otherBusinessClientCannotTrackSomeoneElsesShipment() {
        ShipmentResponse created = createShipmentAsOwner();

        authenticateAs("other-business@shiptrack.com");

        assertThrows(AccessDeniedException.class,
                () -> shipmentService.getShipmentByTrackingNumber(created.getTrackingNumber()));
    }
}
