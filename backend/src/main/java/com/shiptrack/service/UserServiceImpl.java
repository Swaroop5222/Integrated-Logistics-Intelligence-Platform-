package com.shiptrack.service;

import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.UserDto;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDto registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    public UserDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = getUserByEmail(email);
        return mapToDto(user);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    private UserDto mapToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
