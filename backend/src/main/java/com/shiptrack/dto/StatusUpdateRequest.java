package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;

public class StatusUpdateRequest {

    private ShipmentStatus status;
    private String remarks;

    public StatusUpdateRequest() {}

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
