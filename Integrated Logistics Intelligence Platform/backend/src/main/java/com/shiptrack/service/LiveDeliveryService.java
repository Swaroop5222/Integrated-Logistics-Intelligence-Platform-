package com.shiptrack.service;

import com.shiptrack.model.LiveLocation;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LiveDeliveryService {
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(Long deliveryId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 minutes
        emitters.computeIfAbsent(deliveryId, k -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(deliveryId, emitter));
        emitter.onTimeout(() -> removeEmitter(deliveryId, emitter));
        emitter.onError((ex) -> removeEmitter(deliveryId, emitter));

        return emitter;
    }

    private void removeEmitter(Long deliveryId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(deliveryId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(deliveryId);
        }
    }

    public void publishLocation(Long deliveryId, LiveLocation location) {
        List<SseEmitter> list = emitters.get(deliveryId);
        if (list == null || list.isEmpty()) return;

        for (SseEmitter emitter : new ArrayList<>(list)) {
            try {
                emitter.send(SseEmitter.event().name("location").data(location));
            } catch (IOException e) {
                removeEmitter(deliveryId, emitter);
            }
        }
    }
}
