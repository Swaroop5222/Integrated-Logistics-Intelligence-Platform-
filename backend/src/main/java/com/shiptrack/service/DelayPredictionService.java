package com.shiptrack.service;

import com.shiptrack.dto.DelayPredictionResponse;

public interface DelayPredictionService {
    DelayPredictionResponse predictDelay(Long shipmentId);
}
