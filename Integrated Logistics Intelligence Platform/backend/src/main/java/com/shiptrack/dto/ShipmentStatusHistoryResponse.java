package com.shiptrack.dto;

import com.shiptrack.enums.ShipmentStatus;
import java.time.LocalDateTime;

public class ShipmentStatusHistoryResponse {

    private Long id;
    private Long shipmentId;
    private ShipmentStatus status;
    private String remarks;
    private Long updatedById;
    private String updatedByName;
    private LocalDateTime createdAt;

    public ShipmentStatusHistoryResponse() {}

    public ShipmentStatusHistoryResponse(Long id, Long shipmentId, ShipmentStatus status, String remarks, Long updatedById, String updatedByName, LocalDateTime createdAt) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.status = status;
        this.remarks = remarks;
        this.updatedById = updatedById;
        this.updatedByName = updatedByName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

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

    public Long getUpdatedById() {
        return updatedById;
    }

    public void setUpdatedById(Long updatedById) {
        this.updatedById = updatedById;
    }

    public String getUpdatedByName() {
        return updatedByName;
    }

    public void setUpdatedByName(String updatedByName) {
        this.updatedByName = updatedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
