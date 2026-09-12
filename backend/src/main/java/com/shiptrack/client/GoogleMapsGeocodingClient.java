package com.shiptrack.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiptrack.dto.GeoPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class GoogleMapsGeocodingClient implements GeocodingClient {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GoogleMapsGeocodingClient(RestClient.Builder builder,
                                     ObjectMapper objectMapper,
                                     @Value("${google.maps.api-key}") String apiKey) {
        this.restClient = builder.baseUrl("https://maps.googleapis.com").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    @Override
    public GeoPoint geocode(String address) {
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("Address is required for geocoding");
        }
        if (apiKey.isBlank()) {
            throw new IllegalStateException("google.maps.api-key is not configured");
        }
        String body = restClient.get()
                .uri(UriComponentsBuilder.fromPath("/maps/api/geocode/json")
                        .queryParam("address", address)
                        .queryParam("key", apiKey)
                        .build().toUri())
                .retrieve()
                .body(String.class);
        try {
            JsonNode root = objectMapper.readTree(body);
            if (!"OK".equals(root.path("status").asText())) {
                throw new IllegalStateException("Google geocoding failed: " + root.path("status").asText());
            }
            JsonNode location = root.path("results").path(0).path("geometry").path("location");
            return new GeoPoint(location.path("lat").asDouble(), location.path("lng").asDouble());
        } catch (IllegalStateException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to parse Google geocoding response", exception);
        }
    }
}
