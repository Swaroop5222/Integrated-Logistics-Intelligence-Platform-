package com.shiptrack.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_events")
public class DeliveryEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private LocalDateTime timestamp;

    private String note;

    public DeliveryEvent() {}

    public Long getId() {
        return id;
    }

    public Delivery getDelivery() {
        return delivery;
    }

    public void setDelivery(Delivery delivery) {
        this.delivery = delivery;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @PrePersist
    public void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
