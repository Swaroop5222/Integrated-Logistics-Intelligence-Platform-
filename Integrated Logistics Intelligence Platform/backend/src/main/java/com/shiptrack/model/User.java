package com.shiptrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User {

    // =====================================================
    // DATABASE ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // AUTHENTICATION
    // =====================================================

    private String username;

    /*
     * Actual database column is password_hash.
     *
     * @JsonIgnore means password will NOT be returned
     * in API JSON responses.
     */
    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String password;

    private String role;

    // =====================================================
    // ROLE-SPECIFIC ID
    // =====================================================

    /*
     * Examples:
     *
     * CUSTOMER          -> CUST-0001
     * BUSINESS          -> BUS-0001
     * LOGISTIC_OPERATOR -> LOG-0001
     * SUPPORT_AGENT     -> SUP-0001
     */
    @Column(name = "role_specific_id", unique = true)
    private String roleSpecificId;

    // =====================================================
    // PERSONAL INFORMATION
    // =====================================================

    private String firstName;

    private String lastName;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String email;

    private String mobileNumber;

    // =====================================================
    // ADDRESS
    // =====================================================

    private String address;

    private String city;

    private String state;

    private String country;

    private String postalCode;

    // =====================================================
    // BUSINESS INFORMATION
    // =====================================================

    private String companyName;

    private String registrationNumber;

    private String gstTaxId;

    private String contactPersonName;

    // =====================================================
    // LOGISTIC OPERATOR INFORMATION
    // =====================================================

    private String organizationName;

    private String licenseRegistrationNumber;

    private String transportationMode;

    private String operatingArea;

    // =====================================================
    // SUPPORT AGENT INFORMATION
    // =====================================================

    private String employeeId;

    private String department;

    // =====================================================
    // TIMESTAMPS
    // =====================================================

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    @OneToMany(
        mappedBy = "user",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Notification> notifications = new ArrayList<>();
}