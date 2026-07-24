package com.jobtracker.job_tracker_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterviewNoteRequest {

    @NotBlank(message = "Vui lòng chọn ngày phỏng vấn")
    private String interviewDate;

    @Min(value = 1, message = "Đánh giá tối thiểu 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa 5 sao")
    private Integer rating;

    private String notes;
    private String jobApplicationId;
}