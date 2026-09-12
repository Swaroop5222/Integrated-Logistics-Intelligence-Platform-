package com.shiptrack.client;

import com.shiptrack.dto.GeoPoint;

public interface DistanceMatrixClient {
    TravelEstimate getTravelEstimate(GeoPoint origin, GeoPoint destination);

    record TravelEstimate(long distanceMeters, long durationSeconds) {
    }
}
