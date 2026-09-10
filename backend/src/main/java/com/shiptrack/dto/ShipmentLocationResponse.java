package com.shiptrack.dto;

import java.time.LocalDateTime;

public class ShipmentLocationResponse {
    private Long id;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private Long recordedByOperatorId;
    private String recordedByOperatorName;
    private LocalDateTime recordedAt;

    public ShipmentLocationResponse() {}

    public ShipmentLocationResponse(Long id, Double latitude, Double longitude, String locationName,
                                    Long recordedByOperatorId, String recordedByOperatorName,
                                    LocalDateTime recordedAt) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationName = locationName;
        this.recordedByOperatorId = recordedByOperatorId;
        this.recordedByOperatorName = recordedByOperatorName;
        this.recordedAt = recordedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public Long getRecordedByOperatorId() { return recordedByOperatorId; }
    public void setRecordedByOperatorId(Long recordedByOperatorId) { this.recordedByOperatorId = recordedByOperatorId; }
    public String getRecordedByOperatorName() { return recordedByOperatorName; }
    public void setRecordedByOperatorName(String recordedByOperatorName) { this.recordedByOperatorName = recordedByOperatorName; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
