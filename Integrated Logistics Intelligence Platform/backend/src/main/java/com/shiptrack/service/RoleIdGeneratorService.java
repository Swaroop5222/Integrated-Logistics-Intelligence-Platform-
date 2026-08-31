package com.shiptrack.service;

import com.shiptrack.model.RoleIdCounter;
import com.shiptrack.repository.RoleIdCounterRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleIdGeneratorService {

    private final RoleIdCounterRepository counterRepository;

    public RoleIdGeneratorService(RoleIdCounterRepository counterRepository) {
        this.counterRepository = counterRepository;
    }

    @Transactional
    public String generateId(String role) {

        RoleIdCounter counter = counterRepository.findById(role)
                .orElseGet(() -> {
                    RoleIdCounter newCounter = new RoleIdCounter();
                    newCounter.setRole(role);
                    newCounter.setNextId(1L);
                    return counterRepository.save(newCounter);
                });

        Long currentId = counter.getNextId();

        counter.setNextId(currentId + 1);
        counterRepository.save(counter);

        return generateRoleId(role, currentId);
    }

    private String generateRoleId(String role, Long id) {

        String prefix;

        switch (role) {
            case "CUSTOMER":
                prefix = "CUST";
                break;
            case "BUSINESS":
                prefix = "BUS";
                break;
            case "LOGISTIC_OPERATOR":
                prefix = "LOG";
                break;
            case "SUPPORT_AGENT":
                prefix = "SUP";
                break;
            default:
                throw new IllegalArgumentException("Unsupported role: " + role);
        }

        return String.format("%s-%04d", prefix, id);
    }
}