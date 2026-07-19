package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.dto.ChangePasswordRequest;
import com.jobtracker.job_tracker_backend.dto.UpdateProfileRequest;
import com.jobtracker.job_tracker_backend.model.User;
import com.jobtracker.job_tracker_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfile(@PathVariable String id, @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(id, request);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable String id, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }
}