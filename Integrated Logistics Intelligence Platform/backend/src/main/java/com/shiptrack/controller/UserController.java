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

    // =====================================================
    // REGISTER USER
    // POST /api/users
    // =====================================================

    @PostMapping
    @Transactional
    public ResponseEntity<?> createUser(
            @RequestBody RegistrationRequest request) {

        // -------------------------------------------------
        // 1. Validate email
        // -------------------------------------------------

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Email is required");
        }

        String email = request.getEmail().trim();

        // -------------------------------------------------
        // 2. Check duplicate email
        // -------------------------------------------------

        if (userRepository.findByEmail(email).isPresent()) {

            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        // -------------------------------------------------
        // 3. Validate password
        // -------------------------------------------------

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

        // -------------------------------------------------
        // 4. Determine role
        // -------------------------------------------------

        String role = request.getRole();

        if (role == null || role.isBlank()) {
            role = "CUSTOMER";
        }

        role = role.trim().toUpperCase();

        // -------------------------------------------------
        // 5. Prevent ADMIN self-registration
        // -------------------------------------------------

        if ("ADMIN".equals(role)) {

            return ResponseEntity.badRequest()
                    .body("ADMIN registration is not allowed");
        }

        // -------------------------------------------------
        // 6. Validate supported roles
        // -------------------------------------------------

        if (!role.equals("CUSTOMER") &&
                !role.equals("BUSINESS") &&
                !role.equals("LOGISTIC_OPERATOR") &&
                !role.equals("SUPPORT_AGENT")) {

            return ResponseEntity.badRequest()
                    .body("Invalid registration role");
        }

        // -------------------------------------------------
        // 7. Create User
        // -------------------------------------------------

        User user = new User();

        // -------------------------------------------------
        // 8. Personal information
        // -------------------------------------------------

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // -------------------------------------------------
        // 9. Generate full name
        // -------------------------------------------------

        String fullName;

        if ("BUSINESS".equals(role)) {

            fullName = request.getContactPersonName() == null
                    ? ""
                    : request.getContactPersonName().trim();

            if (fullName.isBlank()) {

                return ResponseEntity.badRequest()
                        .body(
                                "Contact Person Name is required for business registration"
                        );
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

        // -------------------------------------------------
        // 10. Contact information
        // -------------------------------------------------

        user.setEmail(email);
        user.setMobileNumber(request.getMobileNumber());

        // Username = email
        user.setUsername(email);

        // -------------------------------------------------
        // 11. Password
        // -------------------------------------------------

        // NEVER set this to null after saving.
        // It must remain available for Hibernate/JPA.
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // -------------------------------------------------
        // 12. Address
        // -------------------------------------------------

        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setCountry(request.getCountry());
        user.setPostalCode(request.getPostalCode());

        // -------------------------------------------------
        // 13. Business information
        // -------------------------------------------------

        user.setCompanyName(request.getCompanyName());
        user.setRegistrationNumber(
                request.getRegistrationNumber()
        );
        user.setGstTaxId(request.getGstTaxId());
        user.setContactPersonName(
                request.getContactPersonName()
        );

        // -------------------------------------------------
        // 14. Logistic Operator information
        // -------------------------------------------------

        user.setOrganizationName(
                request.getOrganizationName()
        );

        user.setLicenseRegistrationNumber(
                request.getLicenseRegistrationNumber()
        );

        user.setTransportationMode(
                request.getTransportationMode()
        );

        user.setOperatingArea(
                request.getOperatingArea()
        );

        // -------------------------------------------------
        // 15. Support Agent information
        // -------------------------------------------------

        user.setEmployeeId(request.getEmployeeId());
        user.setDepartment(request.getDepartment());

        // -------------------------------------------------
        // 16. Set role
        // -------------------------------------------------

        user.setRole(role);

        // -------------------------------------------------
        // 17. Generate role-specific ID
        // -------------------------------------------------

        String roleSpecificId =
                roleIdGeneratorService.generateId(role);

        user.setRoleSpecificId(roleSpecificId);

        // -------------------------------------------------
        // 18. Save user
        // -------------------------------------------------

        User savedUser = userRepository.save(user);

        // -------------------------------------------------
        // IMPORTANT:
        // Do NOT do:
        //
        // savedUser.setPassword(null);
        //
        // because this entity is managed by Hibernate.
        //
        // Password will be hidden using @JsonIgnore
        // inside User.java.
        // -------------------------------------------------

        return ResponseEntity.ok(savedUser);
    }

    // =====================================================
    // GET ALL USERS
    // GET /api/users
    // =====================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // =====================================================
    // GET USER BY ID
    // GET /api/users/{id}
    // =====================================================

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

    // =====================================================
    // DELETE USER
    // DELETE /api/users/{id}
    // =====================================================

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