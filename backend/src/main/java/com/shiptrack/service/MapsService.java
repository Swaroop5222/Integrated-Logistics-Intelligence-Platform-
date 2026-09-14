package com.shiptrack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiptrack.exception.MapsServiceException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MapsService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String geocodingUrl;
    private final String routingUrl;
    private final String userAgent;
    private final Duration readTimeout;

    public MapsService(
            HttpClient httpClient,
            ObjectMapper objectMapper,
            @Value("${shiptrack.maps.geocoding-url}") String geocodingUrl,
            @Value("${shiptrack.maps.routing-url}") String routingUrl,
            @Value("${shiptrack.maps.user-agent}") String userAgent,
            @Value("${shiptrack.maps.read-timeout:15s}") Duration readTimeout) {

        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.geocodingUrl = geocodingUrl;
        this.routingUrl = routingUrl;
        this.userAgent = userAgent;
        this.readTimeout = readTimeout;
    }

    public Coordinates geocode(String address) {

        String url = geocodingUrl
                + "?format=jsonv2&limit=1&q="
                + URLEncoder.encode(address, StandardCharsets.UTF_8);

        JsonNode result = getJson(url);

        if (!result.isArray() || result.isEmpty()) {
            throw new MapsServiceException(
                    "Address could not be geocoded: " + address);
        }

        JsonNode location = result.get(0);

        try {
            return new Coordinates(
                    location.get("lat").asDouble(),
                    location.get("lon").asDouble()
            );
        } catch (RuntimeException exception) {
            throw new MapsServiceException(
                    "Geocoding response did not contain coordinates",
                    exception
            );
        }
    }

    public RouteData route(
            Coordinates origin,
            Coordinates destination) {

        String url = routingUrl
                + "/"
                + origin.longitude()
                + ","
                + origin.latitude()
                + ";"
                + destination.longitude()
                + ","
                + destination.latitude()
                + "?overview=full&geometries=geojson";

        JsonNode result = getJson(url);

        JsonNode routes = result.get("routes");

        if (routes == null
                || !routes.isArray()
                || routes.isEmpty()) {

            throw new MapsServiceException(
                    "No route was found between the supplied locations");
        }

        JsonNode route = routes.get(0);

        JsonNode geometry = route.get("geometry");

        if (geometry == null || geometry.isNull()) {
            throw new MapsServiceException(
                    "Routing response did not contain route geometry");
        }

        try {
            return new RouteData(
                    route.get("distance").asDouble(),
                    route.get("duration").asLong(),
                    objectMapper.writeValueAsString(geometry)
            );
        } catch (IOException | NullPointerException exception) {

            throw new MapsServiceException(
                    "Could not read routing response",
                    exception
            );
        }
    }

    private JsonNode getJson(String url) {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(readTimeout)
                .header("Accept", "application/json")
                .header("User-Agent", userAgent)
                .GET()
                .build();

        try {

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                throw new MapsServiceException(
                        "Maps provider returned HTTP "
                                + response.statusCode()
                );
            }

            return objectMapper.readTree(response.body());

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

            throw new MapsServiceException(
                    "Maps provider request was interrupted",
                    exception
            );

        } catch (IOException | IllegalArgumentException exception) {

            throw new MapsServiceException(
                    "Maps provider request failed",
                    exception
            );
        }
    }

    public record Coordinates(
            double latitude,
            double longitude) {
    }

    public record RouteData(
            double distanceMeters,
            long durationSeconds,
            String geometry) {
    }
}
