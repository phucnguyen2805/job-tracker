package com.jobtracker.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    @NotBlank(message = "Thiếu Google ID Token")
    private String idToken;
}