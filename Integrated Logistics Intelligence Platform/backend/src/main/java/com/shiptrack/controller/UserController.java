package com.shiptrack.controller;

import com.shiptrack.model.RegistrationRequest;
import com.shiptrack.model.User;
import com.shiptrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // REGISTRATION
    // =========================

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody RegistrationRequest request) {

        // 1. Check password and confirm password
        if (request.getPassword() == null ||
                !request.getPassword().equals(request.getConfirmPassword())) {

            return ResponseEntity.badRequest()
                    .body("Password and Confirm Password do not match");
        }

        // 2. Check email already exists
        if (request.getEmail() != null &&
                userRepository.findByEmail(request.getEmail()).isPresent()) {

            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        // 3. Create User entity
        User user = new User();

        // Common fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());

        // Password encryption
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Address
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setCountry(request.getCountry());
        user.setPostalCode(request.getPostalCode());

        // Business fields
        user.setCompanyName(request.getCompanyName());
        user.setRegistrationNumber(request.getRegistrationNumber());
        user.setGstTaxId(request.getGstTaxId());
        user.setContactPersonName(request.getContactPersonName());

        // Logistic Operator fields
        user.setOrganizationName(request.getOrganizationName());
        user.setLicenseRegistrationNumber(
                request.getLicenseRegistrationNumber()
        );
        user.setTransportationMode(request.getTransportationMode());
        user.setOperatingArea(request.getOperatingArea());

        // Support Agent fields
        user.setEmployeeId(request.getEmployeeId());
        user.setDepartment(request.getDepartment());

        // 4. Set role
        String role = request.getRole();

        if (role == null || role.isBlank()) {
            role = "CUSTOMER";
        }

        role = role.toUpperCase();

        // Prevent normal users from creating ADMIN accounts
        if (role.equals("ADMIN")) {
            return ResponseEntity.badRequest()
                    .body("ADMIN registration is not allowed");
        }

        // Allow only supported registration types
        if (!role.equals("CUSTOMER") &&
                !role.equals("BUSINESS") &&
                !role.equals("LOGISTIC_OPERATOR") &&
                !role.equals("SUPPORT_AGENT")) {

            return ResponseEntity.badRequest()
                    .body("Invalid registration role");
        }

        user.setRole(role);

        // 5. Username = email
        user.setUsername(request.getEmail());

        // 6. Save
        User savedUser = userRepository.save(user);

        // 7. Don't return password
        savedUser.setPassword(null);

        return ResponseEntity.ok(savedUser);
    }


    // =========================
    // READ ALL USERS
    // =========================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    // =========================
    // READ USER BY ID
    // =========================

    @GetMapping("/{id}")
   @PreAuthorize("hasAnyRole('CUSTOMER', 'BUSINESS', 'LOGISTIC_OPERATOR', 'SUPPORT_AGENT')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {

        return userRepository.findById(id)
                .map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    // =========================
    // DELETE USER
    // =========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}