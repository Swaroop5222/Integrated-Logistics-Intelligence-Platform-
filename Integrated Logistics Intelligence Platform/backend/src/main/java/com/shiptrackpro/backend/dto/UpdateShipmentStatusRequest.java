package com.shiptrackpro.backend.dto;

import com.shiptrackpro.backend.entity.ShipmentStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateShipmentStatusRequest {

    @NotNull
    private ShipmentStatus status;

    private String description;

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}