package com.shiptrack.service;

import com.shiptrack.dto.DeliveryPerformanceItem;
import com.shiptrack.dto.DeliveryPerformanceReportResponse;
import com.shiptrack.dto.ShipmentAnalyticsResponse;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.enums.ShipmentStatus;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ShipmentAnalyticsProjection;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class ShipmentAnalyticsService {
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public ShipmentAnalyticsService(ShipmentRepository shipmentRepository, UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ShipmentAnalyticsResponse getAnalytics(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        AccessScope scope = getAccessScope();
        List<ShipmentAnalyticsProjection> rows = shipmentRepository.findAnalyticsRows(
                scope.businessClientId(), scope.operatorId(), startOf(from), startOfNextDay(to));

        Map<ShipmentStatus, Long> counts = new EnumMap<>(ShipmentStatus.class);
        for (ShipmentStatus status : ShipmentStatus.values()) counts.put(status, 0L);
        long delayed = 0;
        long inTransit = 0;
        LocalDateTime now = LocalDateTime.now();

        for (ShipmentAnalyticsProjection row : rows) {
            ShipmentStatus status = row.getStatus();
            counts.compute(status, (key, value) -> value + 1);
            if (status == ShipmentStatus.PICKED_UP
                    || status == ShipmentStatus.IN_TRANSIT
                    || status == ShipmentStatus.OUT_FOR_DELIVERY) {
                inTransit++;
                if (isPastEstimate(row, now)) delayed++;
            }
        }

        return new ShipmentAnalyticsResponse(
                from, to, now, rows.size(), counts.get(ShipmentStatus.DELIVERED),
                inTransit, delayed, counts.get(ShipmentStatus.FAILED_DELIVERY),
                counts.get(ShipmentStatus.CANCELLED), counts);
    }

    @Transactional(readOnly = true)
    public DeliveryPerformanceReportResponse getDeliveryPerformance(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        AccessScope scope = getAccessScope();
        List<ShipmentAnalyticsProjection> rows = shipmentRepository.findDeliveredRowsForReport(
                ShipmentStatus.DELIVERED, scope.businessClientId(), scope.operatorId(),
                startOf(from), startOfNextDay(to));

        long onTime = 0;
        long late = 0;
        long withoutEstimate = 0;
        long measured = 0;
        long totalMinutes = 0;
        List<DeliveryPerformanceItem> deliveries = new java.util.ArrayList<>();

        for (ShipmentAnalyticsProjection row : rows) {
            LocalDateTime deliveredAt = row.getDeliveredAt() != null
                    ? row.getDeliveredAt() : row.getUpdatedAt();
            Integer estimate = row.getEstimatedDurationMinutes();
            LocalDateTime routeEstimatedAt = row.getRouteUpdatedAt();
            Long actualMinutes = deliveredAt == null || routeEstimatedAt == null
                    ? null : Duration.between(routeEstimatedAt, deliveredAt).toMinutes();
            String performance;

            if (estimate == null || estimate <= 0 || deliveredAt == null || routeEstimatedAt == null) {
                withoutEstimate++;
                performance = "UNMEASURED";
            } else {
                measured++;
                totalMinutes += actualMinutes;
                if (!deliveredAt.isAfter(routeEstimatedAt.plusMinutes(estimate))) {
                    onTime++;
                    performance = "ON_TIME";
                } else {
                    late++;
                    performance = "LATE";
                }
            }

            deliveries.add(new DeliveryPerformanceItem(row.getId(), row.getTrackingNumber(),
                    row.getCreatedAt(), routeEstimatedAt, deliveredAt, estimate, actualMinutes, performance));
        }

        double onTimeRate = measured == 0 ? 0.0 : onTime * 100.0 / measured;
        double averageMinutes = measured == 0 ? 0.0 : totalMinutes * 1.0 / measured;
        return new DeliveryPerformanceReportResponse(from, to, rows.size(), measured,
                onTime, late, withoutEstimate, round2(onTimeRate), round2(averageMinutes), deliveries);
    }

    private boolean isPastEstimate(ShipmentAnalyticsProjection row, LocalDateTime now) {
        Integer minutes = row.getEstimatedDurationMinutes();
        LocalDateTime routeEstimatedAt = row.getRouteUpdatedAt();
        return minutes != null && minutes > 0 && routeEstimatedAt != null
                && now.isAfter(routeEstimatedAt.plusMinutes(minutes));
    }

    private AccessScope getAccessScope() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found."));
        if (user.getRole() == Role.ADMINISTRATOR) return new AccessScope(null, null);
        if (user.getRole() == Role.BUSINESS_CLIENT) return new AccessScope(user.getId(), null);
        if (user.getRole() == Role.LOGISTICS_OPERATOR) return new AccessScope(null, user.getId());
        throw new AccessDeniedException("Only business clients, logistics operators, and administrators can view these reports.");
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("The 'from' date must be on or before the 'to' date.");
        }
    }

    private LocalDateTime startOf(LocalDate date) {
        return date == null ? LocalDate.of(1, 1, 1).atStartOfDay() : date.atStartOfDay();
    }

    private LocalDateTime startOfNextDay(LocalDate date) {
        return date == null ? LocalDate.of(9999, 12, 31).atStartOfDay()
                : date.plusDays(1).atStartOfDay();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record AccessScope(Long businessClientId, Long operatorId) {
    }
}
