package com.shiptrack.controller;

import com.shiptrack.model.RegistrationRequest;
import com.shiptrack.model.User;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.RoleIdGeneratorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleIdGeneratorService roleIdGeneratorService;

    // REGISTER USER
    @PostMapping
    @Transactional
    public ResponseEntity<?> createUser(
            @RequestBody RegistrationRequest request) {

        // Validate email
        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Email is required");
        }

        String email = request.getEmail().trim();

        // Check duplicate email
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        // Validate password
        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Password is required");
        }

        if (request.getConfirmPassword() == null ||
                !request.getPassword()
                        .equals(request.getConfirmPassword())) {

            return ResponseEntity.badRequest()
                    .body("Password and Confirm Password do not match");
        }

        // Determine role
        String role = request.getRole();

        if (role == null || role.isBlank()) {
            role = "CUSTOMER";
        }

        role = role.trim().toUpperCase();

        // Admin registration is not allowed
        if ("ADMIN".equals(role)) {
            return ResponseEntity.badRequest()
                    .body("ADMIN registration is not allowed");
        }

        // Allow only supported registration roles
        if (!role.equals("CUSTOMER") &&
                !role.equals("BUSINESS") &&
                !role.equals("LOGISTIC_OPERATOR") &&
                !role.equals("SUPPORT_AGENT")) {

            return ResponseEntity.badRequest()
                    .body("Invalid registration role");
        }

        // Create User
        User user = new User();

        // Personal information
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Generate full name
        String fullName;

        if ("BUSINESS".equals(role)) {

            fullName = request.getContactPersonName() == null
                    ? ""
                    : request.getContactPersonName().trim();

            if (fullName.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Contact Person Name is required for business registration");
            }

        } else {

            String firstName = request.getFirstName() == null
                    ? ""
                    : request.getFirstName().trim();

            String lastName = request.getLastName() == null
                    ? ""
                    : request.getLastName().trim();

            fullName = (firstName + " " + lastName).trim();

            if (fullName.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("First name or last name is required");
            }
        }

        user.setFullName(fullName);

        // Contact information
        user.setEmail(email);
        user.setMobileNumber(request.getMobileNumber());

        // Username = email
        user.setUsername(email);

        // Password encryption
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Address
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setCountry(request.getCountry());
        user.setPostalCode(request.getPostalCode());

        // Business information
        user.setCompanyName(request.getCompanyName());
        user.setRegistrationNumber(request.getRegistrationNumber());
        user.setGstTaxId(request.getGstTaxId());
        user.setContactPersonName(request.getContactPersonName());

        // Logistic Operator information
        user.setOrganizationName(request.getOrganizationName());
        user.setLicenseRegistrationNumber(
                request.getLicenseRegistrationNumber()
        );
        user.setTransportationMode(
                request.getTransportationMode()
        );
        user.setOperatingArea(
                request.getOperatingArea()
        );

        // Support Agent information
        user.setEmployeeId(request.getEmployeeId());
        user.setDepartment(request.getDepartment());

        // Set role
        user.setRole(role);

        // Generate role-specific ID
        String roleSpecificId =
                roleIdGeneratorService.generateId(role);

        user.setRoleSpecificId(roleSpecificId);

        // Save user
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // GET ALL USERS
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET USER BY ID
    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole(" +
                    "'CUSTOMER'," +
                    "'BUSINESS'," +
                    "'LOGISTIC_OPERATOR'," +
                    "'SUPPORT_AGENT'," +
                    "'ADMIN'" +
                    ")"
    )
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // DELETE USER
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
