package com.shiptrack;

import com.shiptrack.entity.User;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServicePasswordResetTest {

    private static final String EMAIL = "member@example.com";

    private UserRepository userRepository;
    private JavaMailSender mailSender;
    private PasswordEncoder passwordEncoder;
    private UserServiceImpl userService;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        mailSender = mock(JavaMailSender.class);
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserServiceImpl(userRepository, passwordEncoder, mailSender);

        user = new User();
        user.setEmail(EMAIL);
        user.setPasswordHash(passwordEncoder.encode("original-password"));

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void sendsHashedExpiringOtpToExistingUser() {
        userService.sendPasswordResetOtp(EMAIL);

        var messageCaptor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();
        assertArrayEquals(new String[]{EMAIL}, message.getTo());
        String otp = message.getText().replaceAll("(?s).*code is (\\d{6})\\..*", "$1");

        assertTrue(otp.matches("\\d{6}"));
        assertTrue(passwordEncoder.matches(otp, user.getPasswordResetOtpHash()));
        assertTrue(user.getPasswordResetOtpExpiresAt().isAfter(LocalDateTime.now()));
        assertEquals(0, user.getPasswordResetOtpAttempts());
    }

    @Test
    void doesNotRevealUnknownEmailOrSendMail() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> userService.sendPasswordResetOtp("unknown@example.com"));
        verifyNoInteractions(mailSender);
    }

    @Test
    void resetsPasswordAndConsumesOtp() {
        user.setPasswordResetOtpHash(passwordEncoder.encode("123456"));
        user.setPasswordResetOtpExpiresAt(LocalDateTime.now().plusMinutes(10));

        userService.resetPassword(EMAIL, "123456", "new-password-123");

        assertTrue(passwordEncoder.matches("new-password-123", user.getPasswordHash()));
        assertNull(user.getPasswordResetOtpHash());
        assertNull(user.getPasswordResetOtpExpiresAt());
    }

    @Test
    void rejectsExpiredOtp() {
        user.setPasswordResetOtpHash(passwordEncoder.encode("123456"));
        user.setPasswordResetOtpExpiresAt(LocalDateTime.now().minusSeconds(1));

        assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword(EMAIL, "123456", "new-password-123"));

        assertNull(user.getPasswordResetOtpHash());
    }

    @Test
    void invalidatesOtpAfterFiveIncorrectAttempts() {
        user.setPasswordResetOtpHash(passwordEncoder.encode("123456"));
        user.setPasswordResetOtpExpiresAt(LocalDateTime.now().plusMinutes(10));

        for (int attempt = 0; attempt < 5; attempt++) {
            assertThrows(IllegalArgumentException.class,
                    () -> userService.resetPassword(EMAIL, "000000", "new-password-123"));
        }

        assertNull(user.getPasswordResetOtpHash());
        assertEquals(0, user.getPasswordResetOtpAttempts());
    }
}
