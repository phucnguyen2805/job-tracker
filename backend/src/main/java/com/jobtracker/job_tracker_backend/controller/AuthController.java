package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.config.JwtUtil;
import com.jobtracker.job_tracker_backend.dto.GoogleLoginRequest;
import com.jobtracker.job_tracker_backend.dto.LoginRequest;
import com.jobtracker.job_tracker_backend.dto.RegisterRequest;
import com.jobtracker.job_tracker_backend.model.User;
import com.jobtracker.job_tracker_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        User user = userService.loginWithGoogle(request.getIdToken());
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    private Map<String, Object> buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        return response;
    }
}