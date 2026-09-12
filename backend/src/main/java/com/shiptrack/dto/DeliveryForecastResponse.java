package com.shiptrack.dto;

import java.time.LocalDate;

public class DeliveryForecastResponse {
    private LocalDate forecastStartDate;
    private LocalDate forecastEndDate;
    private int forecastWindowDays;
    private long scheduledShipments;
    private long predictedOnTime;
    private long predictedAtRisk;
    private long predictedDelayed;
    private long alreadyDelivered;
    private long missingScheduleData;

    public LocalDate getForecastStartDate() { return forecastStartDate; }
    public void setForecastStartDate(LocalDate value) { forecastStartDate = value; }
    public LocalDate getForecastEndDate() { return forecastEndDate; }
    public void setForecastEndDate(LocalDate value) { forecastEndDate = value; }
    public int getForecastWindowDays() { return forecastWindowDays; }
    public void setForecastWindowDays(int value) { forecastWindowDays = value; }
    public long getScheduledShipments() { return scheduledShipments; }
    public void setScheduledShipments(long value) { scheduledShipments = value; }
    public long getPredictedOnTime() { return predictedOnTime; }
    public void setPredictedOnTime(long value) { predictedOnTime = value; }
    public long getPredictedAtRisk() { return predictedAtRisk; }
    public void setPredictedAtRisk(long value) { predictedAtRisk = value; }
    public long getPredictedDelayed() { return predictedDelayed; }
    public void setPredictedDelayed(long value) { predictedDelayed = value; }
    public long getAlreadyDelivered() { return alreadyDelivered; }
    public void setAlreadyDelivered(long value) { alreadyDelivered = value; }
    public long getMissingScheduleData() { return missingScheduleData; }
    public void setMissingScheduleData(long value) { missingScheduleData = value; }
}
