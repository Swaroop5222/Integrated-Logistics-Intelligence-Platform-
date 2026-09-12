package com.shiptrack.dto;

import com.shiptrack.enums.Role;

public class AuthResponse {
    private String token;
    private Long id;
    private Long userId;
    private String email;
    private Role role;
    private String fullName;
    private String name;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String email, Role role) {
        this(token, id, email, role, null);
    }

    public AuthResponse(String token, Long id, String email, Role role, String fullName) {
        this.token = token;
        this.id = id;
        this.userId = id;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.name = fullName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
        this.userId = id;
    }

    public Long getUserId() {
        return userId != null ? userId : id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
        this.id = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.name = fullName;
    }

    public String getName() {
        return name != null ? name : fullName;
    }

    public void setName(String name) {
        this.name = name;
        this.fullName = name;
    }
}
