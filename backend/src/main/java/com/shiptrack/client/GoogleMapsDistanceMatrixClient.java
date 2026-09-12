package com.shiptrack.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiptrack.dto.GeoPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class GoogleMapsDistanceMatrixClient implements DistanceMatrixClient {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GoogleMapsDistanceMatrixClient(RestClient.Builder builder,
                                          ObjectMapper objectMapper,
                                          @Value("${google.maps.api-key}") String apiKey) {
        this.restClient = builder.baseUrl("https://maps.googleapis.com").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    @Override
    public TravelEstimate getTravelEstimate(GeoPoint origin, GeoPoint destination) {
        validatePoint(origin, "origin");
        validatePoint(destination, "destination");
        if (apiKey.isBlank()) {
            throw new IllegalStateException("google.maps.api-key is not configured");
        }

        String body = restClient.get()
                .uri(UriComponentsBuilder.fromPath("/maps/api/distancematrix/json")
                        .queryParam("origins", origin.getLatitude() + "," + origin.getLongitude())
                        .queryParam("destinations", destination.getLatitude() + "," + destination.getLongitude())
                        .queryParam("departure_time", "now")
                        .queryParam("key", apiKey)
                        .build().toUri())
                .retrieve()
                .body(String.class);
        try {
            JsonNode root = objectMapper.readTree(body);
            ensureOk(root.path("status").asText(), "Google Maps request");
            JsonNode element = root.path("rows").path(0).path("elements").path(0);
            ensureOk(element.path("status").asText(), "Google Maps route");
            long duration = element.path("duration_in_traffic").path("value")
                    .asLong(element.path("duration").path("value").asLong());
            return new TravelEstimate(element.path("distance").path("value").asLong(), duration);
        } catch (IllegalStateException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to parse Google Maps response", exception);
        }
    }

    private void validatePoint(GeoPoint point, String name) {
        if (point == null || point.getLatitude() == null || point.getLongitude() == null
                || point.getLatitude() < -90 || point.getLatitude() > 90
                || point.getLongitude() < -180 || point.getLongitude() > 180) {
            throw new IllegalArgumentException("Valid " + name + " coordinates are required");
        }
    }

    private void ensureOk(String status, String operation) {
        if (!"OK".equals(status)) {
            throw new IllegalStateException(operation + " failed: " + status);
        }
    }
}
