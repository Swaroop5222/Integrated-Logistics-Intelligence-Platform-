package com.shiptrack.service;

import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.UserDto;
import com.shiptrack.entity.User;

public interface UserService {
    UserDto registerUser(RegisterRequest request);
    UserDto getCurrentUser();
    User getUserByEmail(String email);
    User getUserById(Long id);
}
