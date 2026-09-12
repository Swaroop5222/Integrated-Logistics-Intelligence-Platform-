package com.shiptrack.service;

import com.shiptrack.dto.DeliveryForecastResponse;

public interface DeliveryForecastService {
    DeliveryForecastResponse generateForecast(int days);
}
