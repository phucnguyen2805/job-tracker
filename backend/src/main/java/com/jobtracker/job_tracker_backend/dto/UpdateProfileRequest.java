package com.jobtracker.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Tên người dùng không được để trống")
    @Size(min = 2, max = 50, message = "Tên người dùng phải từ 2-50 ký tự")
    private String username;
}