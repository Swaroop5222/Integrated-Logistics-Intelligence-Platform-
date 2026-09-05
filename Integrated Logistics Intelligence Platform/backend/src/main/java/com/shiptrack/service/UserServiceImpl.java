package com.shiptrack.service;

import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.UserDto;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDto registerUser(RegisterRequest request) {

        // =========================
        // BASIC VALIDATION
        // =========================

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        if (request.getConfirmPassword() == null ||
                !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }

        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required.");
        }

        // ADMINISTRATOR cannot register through public registration
        if (request.getRole() == Role.ADMINISTRATOR) {
            throw new IllegalArgumentException(
                    "Administrator registration is not allowed."
            );
        }

        // =========================
        // CREATE USER
        // =========================

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());

        // =========================
        // COMMON NAME FIELDS
        // =========================

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        String fullName = request.getFullName();

        if ((fullName == null || fullName.isBlank())
                && request.getFirstName() != null
                && request.getLastName() != null) {

            fullName = request.getFirstName() + " "
                    + request.getLastName();
        }

        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Name is required.");
        }

        user.setFullName(fullName);

        // =========================
        // ADDRESS
        // =========================

        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setCountry(request.getCountry());
        user.setPostalCode(request.getPostalCode());

        // =========================
        // ROLE-BASED REGISTRATION
        // =========================

        switch (request.getRole()) {

            case CUSTOMER:

                validateCustomer(request);

                user.setUserCode(generateUserCode("CUS"));

                break;

            case BUSINESS_CLIENT:

                validateBusinessClient(request);

                user.setUserCode(generateUserCode("BUS"));

                user.setCompanyName(request.getCompanyName());
                user.setRegistrationNumber(request.getRegistrationNumber());
                user.setGstTaxId(request.getGstTaxId());
                user.setContactPersonName(request.getContactPersonName());

                break;

            case LOGISTICS_OPERATOR:

                validateLogisticsOperator(request);

                user.setUserCode(generateUserCode("LOG"));

                user.setOrganizationName(request.getOrganizationName());
                user.setLicenseRegistrationNumber(
                        request.getLicenseRegistrationNumber()
                );
                user.setTransportationMode(
                        request.getTransportationMode()
                );
                user.setOperatingArea(request.getOperatingArea());

                break;

            case SUPPORT_AGENT:

                validateSupportAgent(request);

                user.setUserCode(generateUserCode("SUP"));

                user.setEmployeeId(request.getEmployeeId());
                user.setOrganizationName(request.getOrganizationName());
                user.setDepartment(request.getDepartment());

                break;

            default:
                throw new IllegalArgumentException("Invalid registration role.");
        }

        // =========================
        // SAVE USER
        // =========================

        User savedUser = userRepository.save(user);

        return mapToDto(savedUser);
    }

    // =========================================================
    // CUSTOMER VALIDATION
    // =========================================================

    private void validateCustomer(RegisterRequest request) {

        if (isBlank(request.getFirstName())) {
            throw new IllegalArgumentException("First name is required.");
        }

        if (isBlank(request.getLastName())) {
            throw new IllegalArgumentException("Last name is required.");
        }

        if (isBlank(request.getAddress())) {
            throw new IllegalArgumentException("Address is required.");
        }

        if (isBlank(request.getCity())) {
            throw new IllegalArgumentException("City is required.");
        }

        if (isBlank(request.getState())) {
            throw new IllegalArgumentException("State is required.");
        }

        if (isBlank(request.getCountry())) {
            throw new IllegalArgumentException("Country is required.");
        }

        if (isBlank(request.getPostalCode())) {
            throw new IllegalArgumentException("Postal code is required.");
        }
    }

    // =========================================================
    // BUSINESS CLIENT VALIDATION
    // =========================================================

    private void validateBusinessClient(RegisterRequest request) {

        if (isBlank(request.getCompanyName())) {
            throw new IllegalArgumentException(
                    "Company/Business name is required."
            );
        }

        if (isBlank(request.getRegistrationNumber())) {
            throw new IllegalArgumentException(
                    "Registration number is required."
            );
        }

        if (isBlank(request.getGstTaxId())) {
            throw new IllegalArgumentException(
                    "GST/Tax ID is required."
            );
        }

        if (isBlank(request.getContactPersonName())) {
            throw new IllegalArgumentException(
                    "Contact person name is required."
            );
        }

        validateAddress(request);
    }

    // =========================================================
    // LOGISTICS OPERATOR VALIDATION
    // =========================================================

    private void validateLogisticsOperator(RegisterRequest request) {

        if (isBlank(request.getFullName())) {
            throw new IllegalArgumentException("Full name is required.");
        }

        if (isBlank(request.getOrganizationName())) {
            throw new IllegalArgumentException(
                    "Organization/Company name is required."
            );
        }

        if (isBlank(request.getLicenseRegistrationNumber())) {
            throw new IllegalArgumentException(
                    "License/Registration number is required."
            );
        }

        if (isBlank(request.getTransportationMode())) {
            throw new IllegalArgumentException(
                    "Transportation mode is required."
            );
        }

        if (isBlank(request.getOperatingArea())) {
            throw new IllegalArgumentException(
                    "Operating area is required."
            );
        }

        validateAddress(request);
    }

    // =========================================================
    // SUPPORT AGENT VALIDATION
    // =========================================================

    private void validateSupportAgent(RegisterRequest request) {

        if (isBlank(request.getFullName())) {
            throw new IllegalArgumentException("Full name is required.");
        }

        if (isBlank(request.getEmployeeId())) {
            throw new IllegalArgumentException(
                    "Employee ID is required."
            );
        }

        if (isBlank(request.getOrganizationName())) {
            throw new IllegalArgumentException(
                    "Organization/Company name is required."
            );
        }

        if (isBlank(request.getDepartment())) {
            throw new IllegalArgumentException(
                    "Support department is required."
            );
        }

        validateAddress(request);
    }

    // =========================================================
    // ADDRESS VALIDATION
    // =========================================================

    private void validateAddress(RegisterRequest request) {

        if (isBlank(request.getAddress())) {
            throw new IllegalArgumentException("Address is required.");
        }

        if (isBlank(request.getCity())) {
            throw new IllegalArgumentException("City is required.");
        }

        if (isBlank(request.getState())) {
            throw new IllegalArgumentException("State is required.");
        }

        if (isBlank(request.getCountry())) {
            throw new IllegalArgumentException("Country is required.");
        }

        if (isBlank(request.getPostalCode())) {
            throw new IllegalArgumentException("Postal code is required.");
        }
    }

    // =========================================================
    // GENERATE ROLE-BASED USER CODE
    // =========================================================

    private synchronized String generateUserCode(String prefix) {

        long count = userRepository.countByUserCodeStartingWith(prefix + "-");

        long nextNumber = count + 1;

        String userCode;

        do {
            userCode = prefix + "-" +
                    String.format("%05d", nextNumber);

            nextNumber++;

        } while (userRepository.existsByUserCode(userCode));

        return userCode;
    }

    // =========================================================
    // UTILITY
    // =========================================================

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    @Override
    public UserDto getCurrentUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = getUserByEmail(email);

        return mapToDto(user);
    }

    // =========================================================
    // FIND USER BY EMAIL
    // =========================================================

    @Override
    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );
    }

    // =========================================================
    // FIND USER BY ID
    // =========================================================

    @Override
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with ID: " + id
                        )
                );
    }

    // =========================================================
    // MAP USER TO DTO
    // =========================================================

    private UserDto mapToDto(User user) {

        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}