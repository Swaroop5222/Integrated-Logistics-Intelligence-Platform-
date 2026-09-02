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

    // Database ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Authentication
    private String username;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String password;

    private String role;

    // Role-specific ID
    @Column(name = "role_specific_id", unique = true)
    private String roleSpecificId;

    // Personal information
    private String firstName;
    private String lastName;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String email;
    private String mobileNumber;

    // Address
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;

    // Business information
    private String companyName;
    private String registrationNumber;
    private String gstTaxId;
    private String contactPersonName;

    // Logistic Operator information
    private String organizationName;
    private String licenseRegistrationNumber;
    private String transportationMode;
    private String operatingArea;

    // Support Agent information
    private String employeeId;
    private String department;

    // Timestamps
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

    // Notifications
    @OneToMany(
        mappedBy = "user",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Notification> notifications = new ArrayList<>();
}
