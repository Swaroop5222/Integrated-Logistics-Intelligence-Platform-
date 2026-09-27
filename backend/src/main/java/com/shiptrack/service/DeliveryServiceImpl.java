package com.shiptrack.service;

import com.shiptrack.dto.DeliveryConfirmationRequest;
import com.shiptrack.dto.DeliveryResponse;
import com.shiptrack.dto.SignatureRequest;
import com.shiptrack.dto.SignatureResponse;
import com.shiptrack.entity.Delivery;
import com.shiptrack.entity.DeliverySignature;
import com.shiptrack.entity.Shipment;
import com.shiptrack.enums.DeliveryStatus;
import com.shiptrack.enums.SignatureStatus;
import com.shiptrack.repository.DeliveryRepository;
import com.shiptrack.repository.DeliverySignatureRepository;
import com.shiptrack.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

@Service
@Transactional
public class DeliveryServiceImpl implements DeliveryService {

        private final DeliveryRepository deliveryRepository;
        private final DeliverySignatureRepository signatureRepository;
        private final ShipmentRepository shipmentRepository;

        public DeliveryServiceImpl(
                        DeliveryRepository deliveryRepository,
                        DeliverySignatureRepository signatureRepository,
                        ShipmentRepository shipmentRepository) {

                this.deliveryRepository = deliveryRepository;
                this.signatureRepository = signatureRepository;
                this.shipmentRepository = shipmentRepository;
        }

        @Override
        public DeliveryResponse confirmDelivery(
                        DeliveryConfirmationRequest request) {

                if (request == null) {
                        throw new RuntimeException("Delivery confirmation request cannot be null");
                }

                if (request.getShipmentId() == null) {
                        throw new RuntimeException("Shipment ID is required");
                }

                if (request.getDeliveryPhoto() == null || request.getDeliveryPhoto().trim().isEmpty()) {

                        throw new RuntimeException("Delivery photo is required for every delivery");
                }

                if (request.isCustomerAvailable()
                                && !request.isCustomerDetailsVerified()) {

                        throw new RuntimeException("Customer details must be verified when customer is present");
                }

                Shipment shipment = shipmentRepository
                                .findById(request.getShipmentId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Shipment not found: " + request.getShipmentId()));

                Delivery delivery = deliveryRepository.findByShipmentId(request.getShipmentId()).orElse(null);

                if (delivery != null && delivery.getStatus() == DeliveryStatus.DELIVERED) {

                        throw new RuntimeException("Delivery has already been completed");
                }

                if (delivery == null) {
                        delivery = new Delivery();
                        delivery.setShipment(shipment);
                }

                delivery.setCustomerAvailable(request.isCustomerAvailable());

                delivery.setCustomerDetailsVerified(request.isCustomerDetailsVerified());

                delivery.setDeliveryPhoto(request.getDeliveryPhoto());

                delivery.setDeliveryDate(
                                request.getDeliveryDate() != null ? request.getDeliveryDate() : LocalDateTime.now());

                delivery.setNotes(request.getNotes());

                delivery.setConfirmedAt(LocalDateTime.now());

                delivery.setStatus(DeliveryStatus.DELIVERY_RECORDED);

                delivery = deliveryRepository.save(delivery);

                DeliverySignature signature = signatureRepository.findByDeliveryId(delivery.getId()).orElse(null);

                if (signature == null) {

                        signature = new DeliverySignature();

                        signature.setDelivery(delivery);

                        signature.setStatus(SignatureStatus.PENDING);

                        signatureRepository.save(signature);
                }

                return mapToDeliveryResponse(delivery);
        }

        @Override
        @Transactional(readOnly = true)
        public DeliveryResponse getDeliveryByShipmentId(Long shipmentId) {

                Delivery delivery = deliveryRepository.findByShipmentId(shipmentId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Delivery not found for shipment: "
                                                                + shipmentId));

                return mapToDeliveryResponse(delivery);
        }

        @Override
        public SignatureResponse saveSignature(Long deliveryId, SignatureRequest request) {

                if (request == null || request.getSignatureData() == null
                                || request.getSignatureData().trim().isEmpty()) {

                        throw new RuntimeException("Signature data is required");
                }

                Delivery delivery = deliveryRepository.findById(deliveryId).orElseThrow(() -> new RuntimeException(
                                "Delivery not found: " + deliveryId));

                if (delivery.getStatus() != DeliveryStatus.DELIVERY_RECORDED
                                && delivery.getStatus() != DeliveryStatus.DELIVERED) {

                        throw new RuntimeException("Delivery must be recorded before submitting signature");
                }

                if (delivery.getDeliveryPhoto() == null || delivery.getDeliveryPhoto().trim().isEmpty()) {

                        throw new RuntimeException("Delivery photo is required before signature submission");
                }

                String signatureData = request.getSignatureData();

                String signatureHash = generateHash(signatureData);

                DeliverySignature signature = signatureRepository.findByDeliveryId(deliveryId).orElse(null);

                if (signature == null) {

                        signature = new DeliverySignature();

                        signature.setDelivery(delivery);
                }

                signature.setSignatureData(signatureData);

                signature.setSignatureHash(signatureHash);

                signature.setStatus(SignatureStatus.SAVED);

                signature = signatureRepository.save(signature);

                return mapToSignatureResponse(signature);
        }

        @Override
        @Transactional(readOnly = true)
        public SignatureResponse getSignature(Long deliveryId) {

                DeliverySignature signature = signatureRepository.findByDeliveryId(deliveryId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Signature not found for delivery: "
                                                                + deliveryId));

                return mapToSignatureResponse(signature);
        }

        @Override
        public SignatureResponse verifySignature(Long deliveryId) {

                DeliverySignature signature = signatureRepository.findByDeliveryId(deliveryId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Signature not found for delivery: "
                                                                + deliveryId));

                if (signature.getSignatureData() == null || signature.getSignatureHash() == null) {

                        signature.setStatus(SignatureStatus.INVALID);

                        signatureRepository.save(signature);

                        return mapToSignatureResponse(signature);
                }

                String currentHash = generateHash(signature.getSignatureData());

                if (currentHash.equals(signature.getSignatureHash())) {

                        signature.setStatus(SignatureStatus.VERIFIED);

                        Delivery delivery = signature.getDelivery();

                        delivery.setStatus(DeliveryStatus.DELIVERED);

                        deliveryRepository.save(delivery);

                } else {

                        signature.setStatus(SignatureStatus.INVALID);
                }

                signatureRepository.save(signature);

                return mapToSignatureResponse(signature);
        }

        private String generateHash(String data) {

                try {

                        MessageDigest digest = MessageDigest.getInstance("SHA-256");

                        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));

                        StringBuilder hexString = new StringBuilder();

                        for (byte b : hash) {

                                String hex = Integer.toHexString(0xff & b);

                                if (hex.length() == 1) {
                                        hexString.append('0');
                                }

                                hexString.append(hex);
                        }

                        return hexString.toString();

                } catch (Exception e) {

                        throw new RuntimeException("Unable to generate signature hash", e);
                }
        }

        private DeliveryResponse mapToDeliveryResponse(Delivery delivery) {

                DeliveryResponse response = new DeliveryResponse();

                response.setDeliveryId(delivery.getId());

                response.setShipmentId(delivery.getShipment().getId());

                response.setCustomerAvailable(delivery.isCustomerAvailable());

                response.setCustomerDetailsVerified(delivery.isCustomerDetailsVerified());

                response.setPhotoUploaded(
                                delivery.getDeliveryPhoto() != null && !delivery.getDeliveryPhoto().isBlank());

                response.setStatus(delivery.getStatus());

                response.setDeliveryDate(delivery.getDeliveryDate());

                response.setNotes(delivery.getNotes());

                response.setConfirmedAt(delivery.getConfirmedAt());

                return response;
        }

        private SignatureResponse mapToSignatureResponse(DeliverySignature signature) {

                SignatureResponse response = new SignatureResponse();

                response.setSignatureId(signature.getId());

                response.setDeliveryId(signature.getDelivery().getId());

                response.setShipmentId(signature.getDelivery().getShipment().getId());

                response.setStatus(signature.getStatus());

                response.setCreatedAt(signature.getCreatedAt());

                response.setVerifiedAt(signature.getVerifiedAt());

                return response;
        }
}