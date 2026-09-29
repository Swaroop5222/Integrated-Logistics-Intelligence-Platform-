package com.shiptrack.dto;

import java.time.LocalDate;
import java.util.List;

public record DeliveryPerformanceReportResponse(
        LocalDate from,
        LocalDate to,
        long completedDeliveries,
        long measuredDeliveries,
        long onTimeDeliveries,
        long lateDeliveries,
        long withoutRouteEstimate,
        double onTimeRatePercent,
        double averageDeliveryMinutes,
        List<DeliveryPerformanceItem> deliveries) {
}
