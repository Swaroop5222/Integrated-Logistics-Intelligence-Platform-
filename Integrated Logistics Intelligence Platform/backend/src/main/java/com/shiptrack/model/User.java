package com.shiptrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Common authentication fields
    private String username;
    private String password;
    private String role;

    // Common personal/contact information
    private String firstName;
    private String lastName;
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
}