package com.shiptrack.service;

import com.shiptrack.dto.RouteRequest;
import com.shiptrack.dto.RouteResponse;

public interface RouteService {
    RouteResponse saveRoute(Long shipmentId, RouteRequest request);
    RouteResponse getRoute(Long shipmentId);
}
