package com.jobtracker.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Tiêu đề công việc không được để trống")
    @Size(max = 100, message = "Tiêu đề tối đa 100 ký tự")
    private String title;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

    private String status;
    private String dueDate;
    private String jobApplicationId;
    private String userId;
}