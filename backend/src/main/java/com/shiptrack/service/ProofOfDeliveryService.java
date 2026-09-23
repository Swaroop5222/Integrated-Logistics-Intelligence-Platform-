package com.shiptrack.service;

import com.shiptrack.dto.ProofOfDeliveryRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;

public interface ProofOfDeliveryService {
    ProofOfDeliveryResponse createProofOfDelivery(Long shipmentId, ProofOfDeliveryRequest request);
    ProofOfDeliveryResponse getProofOfDelivery(Long shipmentId);
}
