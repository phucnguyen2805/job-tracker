package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.model.User;
import com.jobtracker.job_tracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello, Job Tracker Backend is running!";
    }
}