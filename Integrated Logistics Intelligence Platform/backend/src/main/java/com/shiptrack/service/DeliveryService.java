package com.shiptrack.service;

import com.shiptrack.model.Delivery;
import com.shiptrack.model.DeliveryEvent;
import com.shiptrack.model.DeliveryStatus;
import com.shiptrack.model.LiveLocation;
import com.shiptrack.repository.DeliveryEventRepository;
import com.shiptrack.repository.DeliveryRepository;
import com.shiptrack.repository.LiveLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {
    private final DeliveryRepository deliveryRepository;
    private final DeliveryEventRepository eventRepository;
    private final LiveLocationRepository locationRepository;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           DeliveryEventRepository eventRepository,
                           LiveLocationRepository locationRepository) {
        this.deliveryRepository = deliveryRepository;
        this.eventRepository = eventRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional
    public Delivery createDelivery(Delivery delivery) {
        Delivery saved = deliveryRepository.save(delivery);
        DeliveryEvent ev = new DeliveryEvent();
        ev.setDelivery(saved);
        ev.setStatus(saved.getStatus());
        ev.setTimestamp(null);
        eventRepository.save(ev);
        return saved;
    }

    public Optional<Delivery> getDelivery(Long id) {
        return deliveryRepository.findById(id);
    }

    public List<Delivery> listAll() {
        return deliveryRepository.findAll();
    }

    @Transactional
    public Delivery updateStatus(Long deliveryId, DeliveryStatus status, String note) {
        Delivery d = deliveryRepository.findById(deliveryId).orElseThrow(() ->
                new RuntimeException("Delivery not found"));
        d.setStatus(status);
        DeliveryEvent ev = new DeliveryEvent();
        ev.setDelivery(d);
        ev.setStatus(status);
        ev.setNote(note);
        eventRepository.save(ev);
        return deliveryRepository.save(d);
    }

    @Transactional
    public LiveLocation addLocation(Long deliveryId, LiveLocation location) {
        Delivery d = deliveryRepository.findById(deliveryId).orElseThrow(() ->
                new RuntimeException("Delivery not found"));
        location.setDelivery(d);
        return locationRepository.save(location);
    }

    public List<DeliveryEvent> getEvents(Long deliveryId) {
        return eventRepository.findByDeliveryIdOrderByTimestampAsc(deliveryId);
    }

    public List<LiveLocation> getLocations(Long deliveryId) {
        return locationRepository.findByDeliveryIdOrderByTimestampAsc(deliveryId);
    }
}
