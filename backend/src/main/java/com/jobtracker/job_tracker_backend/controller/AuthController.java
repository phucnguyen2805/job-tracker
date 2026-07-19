package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.dto.LoginRequest;
import com.jobtracker.job_tracker_backend.dto.RegisterRequest;
import com.jobtracker.job_tracker_backend.model.User;
import com.jobtracker.job_tracker_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);
        return ResponseEntity.ok(user);
    }
}