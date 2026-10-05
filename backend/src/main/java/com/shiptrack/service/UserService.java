package com.shiptrack.service;

import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.UserDto;
import com.shiptrack.entity.User;

import java.util.List;

public interface UserService {
    UserDto registerUser(RegisterRequest request);
    UserDto getCurrentUser();
    List<UserDto> getLogisticsOperators();
    List<UserDto> getCustomers();
    User getUserByEmail(String email);
    User getUserById(Long id);
}
