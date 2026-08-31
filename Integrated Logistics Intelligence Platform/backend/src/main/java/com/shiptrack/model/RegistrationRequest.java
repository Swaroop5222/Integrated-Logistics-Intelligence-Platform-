package com.shiptrack.model;

import lombok.Data;

@Data
public class RegistrationRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;

    private String password;
    private String confirmPassword;

    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;

    private String companyName;
    private String registrationNumber;
    private String gstTaxId;
    private String contactPersonName;

    private String organizationName;
    private String licenseRegistrationNumber;
    private String transportationMode;
    private String operatingArea;

    private String employeeId;
    private String department;

    private String role;
}