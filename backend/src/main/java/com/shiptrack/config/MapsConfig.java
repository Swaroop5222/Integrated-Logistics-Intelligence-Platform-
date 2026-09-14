package com.shiptrack.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class MapsConfig {

    @Bean
    public HttpClient mapsHttpClient(
            @Value("${shiptrack.maps.connect-timeout:5s}")
            Duration connectTimeout) {

        return HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}