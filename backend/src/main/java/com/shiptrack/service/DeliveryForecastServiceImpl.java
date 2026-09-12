package com.shiptrack.service;

import com.shiptrack.dto.DelayPredictionResponse;
import com.shiptrack.dto.DeliveryForecastResponse;
import com.shiptrack.dto.ShipmentResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DeliveryForecastServiceImpl implements DeliveryForecastService {
    private final ShipmentService shipmentService;
    private final DelayPredictionService delayPredictionService;

    public DeliveryForecastServiceImpl(ShipmentService shipmentService,
                                       DelayPredictionService delayPredictionService) {
        this.shipmentService = shipmentService;
        this.delayPredictionService = delayPredictionService;
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryForecastResponse generateForecast(int days) {
        int window = Math.max(1, Math.min(days, 90));
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(window - 1L);
        DeliveryForecastResponse response = new DeliveryForecastResponse();
        response.setForecastStartDate(start);
        response.setForecastEndDate(end);
        response.setForecastWindowDays(window);

        for (ShipmentResponse shipment : shipmentService.getAllShipments()) {
            if (shipment.getExpectedDeliveryDate() == null) {
                response.setMissingScheduleData(response.getMissingScheduleData() + 1);
                continue;
            }
            if (shipment.getStatus() == com.shiptrack.enums.ShipmentStatus.DELIVERED) {
                response.setAlreadyDelivered(response.getAlreadyDelivered() + 1);
            }
            if (shipment.getExpectedDeliveryDate().isBefore(start)
                    || shipment.getExpectedDeliveryDate().isAfter(end)) continue;

            response.setScheduledShipments(response.getScheduledShipments() + 1);
            DelayPredictionResponse prediction = delayPredictionService.predictDelay(shipment.getId());
            if ("HIGH".equals(prediction.getRiskLevel()) || "DELAYED".equals(prediction.getRiskLevel())) {
                response.setPredictedDelayed(response.getPredictedDelayed() + 1);
            } else if ("MEDIUM".equals(prediction.getRiskLevel())) {
                response.setPredictedAtRisk(response.getPredictedAtRisk() + 1);
            } else if ("LOW".equals(prediction.getRiskLevel()) || "ON_TIME".equals(prediction.getRiskLevel())) {
                response.setPredictedOnTime(response.getPredictedOnTime() + 1);
            }
        }
        return response;
    }
}
