package com.shiptrackpro.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UpdateShipmentRequest {

    @NotBlank
    private String receiverName;

    @NotBlank
    private String receiverAddress;

    @NotBlank
    private String packageDescription;

    @NotNull
    @Positive
    private Double packageWeight;

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverAddress() {
        return receiverAddress;
    }

    public void setReceiverAddress(String receiverAddress) {
        this.receiverAddress = receiverAddress;
    }

    public String getPackageDescription() {
        return packageDescription;
    }

    public void setPackageDescription(String packageDescription) {
        this.packageDescription = packageDescription;
    }

    public Double getPackageWeight() {
        return packageWeight;
    }

    public void setPackageWeight(Double packageWeight) {
        this.packageWeight = packageWeight;
    }
}