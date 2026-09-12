package com.shiptrack.client;

import com.shiptrack.dto.GeoPoint;

public interface GeocodingClient {
    GeoPoint geocode(String address);
}
