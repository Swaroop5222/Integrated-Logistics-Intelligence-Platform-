package com.shiptrack.repository;

import com.shiptrack.model.RoleIdCounter;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleIdCounterRepository
        extends JpaRepository<RoleIdCounter, String> {
}