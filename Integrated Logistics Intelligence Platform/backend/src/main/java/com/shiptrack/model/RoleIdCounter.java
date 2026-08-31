package com.shiptrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name = "role_id_counter")
public class RoleIdCounter {

    @Id
    private String role;

    private Long nextId;
}