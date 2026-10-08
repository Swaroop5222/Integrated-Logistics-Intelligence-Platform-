package com.shiptrack.service;

import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.UserDto;
import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final String REGISTER_ID_PREFIX = "BUS-";
    private static final String REGISTER_ID_CHARS = "0123456789ABCDEF";
    private static final int REGISTER_ID_SUFFIX_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int PASSWORD_RESET_OTP_LIFETIME_MINUTES = 10;
    private static final int PASSWORD_RESET_OTP_MAX_ATTEMPTS = 5;
    private static final SecureRandom OTP_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Override
    public UserDto registerUser(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());

        // Only BUSINESS_CLIENT accounts automatically receive a Business Client
        // registerId. The client must never supply this value themselves; it is
        // always generated and persisted by the backend, and returned in the
        // registration response.
        if (request.getRole() == Role.BUSINESS_CLIENT) {
            user.setRegisterId(generateUniqueRegisterId());
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    private synchronized String generateUniqueRegisterId() {
        String candidate;
        do {
            candidate = REGISTER_ID_PREFIX + randomSuffix();
        } while (userRepository.existsByRegisterId(candidate));
        return candidate;
    }

    private String randomSuffix() {
        StringBuilder sb = new StringBuilder(REGISTER_ID_SUFFIX_LENGTH);
        for (int i = 0; i < REGISTER_ID_SUFFIX_LENGTH; i++) {
            sb.append(REGISTER_ID_CHARS.charAt(RANDOM.nextInt(REGISTER_ID_CHARS.length())));
        }
        return sb.toString();
    }

    @Override
    public UserDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = getUserByEmail(email);
        return mapToDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getLogisticsOperators() {
        return userRepository.findByRole(Role.LOGISTICS_OPERATOR)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getCustomers() {
        return userRepository.findByRole(Role.CUSTOMER)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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

    @Override
    public void sendPasswordResetOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
            user.setPasswordResetOtpHash(passwordEncoder.encode(otp));
            user.setPasswordResetOtpExpiresAt(LocalDateTime.now().plusMinutes(PASSWORD_RESET_OTP_LIFETIME_MINUTES));
            user.setPasswordResetOtpAttempts(0);
            userRepository.save(user);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Your ShipTrack Pro password reset code");
            message.setText("Your password reset code is " + otp
                    + ". It expires in " + PASSWORD_RESET_OTP_LIFETIME_MINUTES
                    + " minutes. If you did not request this, you can ignore this email.");
            mailSender.send(message);
        });
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        if (email == null || email.isBlank() || otp == null || otp.isBlank()
                || newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Email, verification code, and new password are required");
        }
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (user.getPasswordResetOtpHash() == null || user.getPasswordResetOtpExpiresAt() == null
                || user.getPasswordResetOtpExpiresAt().isBefore(LocalDateTime.now())
                || user.getPasswordResetOtpAttempts() >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
            clearPasswordResetOtp(user);
            userRepository.save(user);
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        if (!passwordEncoder.matches(otp, user.getPasswordResetOtpHash())) {
            user.setPasswordResetOtpAttempts(user.getPasswordResetOtpAttempts() + 1);
            if (user.getPasswordResetOtpAttempts() >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
                clearPasswordResetOtp(user);
            }
            userRepository.save(user);
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        clearPasswordResetOtp(user);
        userRepository.save(user);
    }

    private void clearPasswordResetOtp(User user) {
        user.setPasswordResetOtpHash(null);
        user.setPasswordResetOtpExpiresAt(null);
        user.setPasswordResetOtpAttempts(0);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getRegisterId(),
                user.getPhoneNumber(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
