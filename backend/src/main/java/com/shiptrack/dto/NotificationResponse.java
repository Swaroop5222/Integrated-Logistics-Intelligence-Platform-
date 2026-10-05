package com.shiptrack.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private Long shipmentId;
    private String trackingNumber;
    private String type;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse(Long id, Long shipmentId, String trackingNumber,
                                String type, String title, String message,
                                boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.trackingNumber = trackingNumber;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getShipmentId() { return shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
