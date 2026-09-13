package com.shiptrack.dto;

public class LocationUpdateRequest {
    private Double latitude;
    private Double longitude;
    private String locationName;

    public LocationUpdateRequest() {}
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
}
