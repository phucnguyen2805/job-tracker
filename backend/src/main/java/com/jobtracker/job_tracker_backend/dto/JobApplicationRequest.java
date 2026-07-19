package com.jobtracker.job_tracker_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class JobApplicationRequest {

    @NotBlank(message = "Tên công ty không được để trống")
    private String company;

    @NotBlank(message = "Vị trí ứng tuyển không được để trống")
    private String position;

    private String status;
    private String appliedDate;
    private String deadline;
    private String notes;
    private String userId;

    private String contactName;
    private String contactEmail;
    private String contactPhone;

    private List<String> tags;
}