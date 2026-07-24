package com.jobtracker.job_tracker_backend.service;

import com.jobtracker.job_tracker_backend.dto.LoginRequest;
import com.jobtracker.job_tracker_backend.dto.RegisterRequest;
import com.jobtracker.job_tracker_backend.exception.EmailAlreadyExistsException;
import com.jobtracker.job_tracker_backend.exception.InvalidCredentialsException;
import com.jobtracker.job_tracker_backend.model.User;
import com.jobtracker.job_tracker_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User existingUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("phuc");
        registerRequest.setEmail("phuc@example.com");
        registerRequest.setPassword("matkhau123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("phuc@example.com");
        loginRequest.setPassword("matkhau123");

        existingUser = new User();
        existingUser.setId("user-id-1");
        existingUser.setUsername("phuc");
        existingUser.setEmail("phuc@example.com");
        existingUser.setPassword("mat-khau-da-ma-hoa");
    }

    @Test
    void register_ThanhCong_KhiEmailChuaTonTai() {
        // Sắp xếp (Arrange)
        when(userRepository.findByEmail("phuc@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("matkhau123")).thenReturn("mat-khau-da-ma-hoa");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Thực thi (Act)
        User result = userService.register(registerRequest);

        // Kiểm tra (Assert)
        assertNotNull(result);
        assertEquals("phuc", result.getUsername());
        assertEquals("phuc@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_NemLoi_KhiEmailDaTonTai() {
        when(userRepository.findByEmail("phuc@example.com")).thenReturn(Optional.of(existingUser));

        assertThrows(EmailAlreadyExistsException.class, () -> {
            userService.register(registerRequest);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ThanhCong_KhiEmailVaMatKhauDung() {
        when(userRepository.findByEmail("phuc@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("matkhau123", "mat-khau-da-ma-hoa")).thenReturn(true);

        User result = userService.login(loginRequest);

        assertNotNull(result);
        assertEquals("phuc@example.com", result.getEmail());
    }

    @Test
    void login_NemLoi_KhiMatKhauSai() {
        when(userRepository.findByEmail("phuc@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("matkhau123", "mat-khau-da-ma-hoa")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> {
            userService.login(loginRequest);
        });
    }

    @Test
    void login_NemLoi_KhiEmailKhongTonTai() {
        when(userRepository.findByEmail("phuc@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> {
            userService.login(loginRequest);
        });
    }
}