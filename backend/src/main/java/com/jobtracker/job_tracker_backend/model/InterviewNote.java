package com.jobtracker.job_tracker_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interview_notes")
public class InterviewNote {
    @Id
    private String id;
    private String jobApplicationId;
    private String userId;
    private String interviewDate; // "yyyy-MM-dd"
    private Integer rating;       // 1-5 sao, tự đánh giá bản thân
    private String notes;         // câu hỏi gặp phải, cảm nhận...
    private Instant createdAt;
}