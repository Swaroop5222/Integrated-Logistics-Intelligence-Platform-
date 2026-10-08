package com.shiptrack.dto;

import java.time.LocalDate;
import java.util.List;

public class DeliveryPerformanceReportResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private long onTimeDeliveries;
    private long delayedDeliveries;
    private long completedDeliveries;
    private String onTimeDefinition;
    private List<DeliveryPerformanceRecord> records;

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public long getOnTimeDeliveries() { return onTimeDeliveries; }
    public void setOnTimeDeliveries(long onTimeDeliveries) { this.onTimeDeliveries = onTimeDeliveries; }
    public long getDelayedDeliveries() { return delayedDeliveries; }
    public void setDelayedDeliveries(long delayedDeliveries) { this.delayedDeliveries = delayedDeliveries; }
    public long getCompletedDeliveries() { return completedDeliveries; }
    public void setCompletedDeliveries(long completedDeliveries) { this.completedDeliveries = completedDeliveries; }
    public String getOnTimeDefinition() { return onTimeDefinition; }
    public void setOnTimeDefinition(String onTimeDefinition) { this.onTimeDefinition = onTimeDefinition; }
    public List<DeliveryPerformanceRecord> getRecords() { return records; }
    public void setRecords(List<DeliveryPerformanceRecord> records) { this.records = records; }
}
