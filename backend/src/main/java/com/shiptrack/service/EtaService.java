package com.shiptrack.service;

import com.shiptrack.dto.EtaResponse;

public interface EtaService {

    EtaResponse calculateEta(Long shipmentId);
}