package com.shiptrack.service;

import com.shiptrack.dto.DeliveryConfirmationRequest;
import com.shiptrack.dto.DeliveryResponse;
import com.shiptrack.dto.SignatureRequest;
import com.shiptrack.dto.SignatureResponse;

public interface DeliveryService {

        DeliveryResponse confirmDelivery(
                        DeliveryConfirmationRequest request);

        DeliveryResponse getDeliveryByShipmentId(
                        Long shipmentId);

        SignatureResponse saveSignature(
                        Long deliveryId,
                        SignatureRequest request);

        SignatureResponse getSignature(
                        Long deliveryId);

        SignatureResponse verifySignature(
                        Long deliveryId);
}