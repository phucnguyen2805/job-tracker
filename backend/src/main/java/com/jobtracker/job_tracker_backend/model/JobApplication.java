package com.jobtracker.job_tracker_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "job_applications")
public class JobApplication {
    @Id
    private String id;
    private String company;
    private String position;
    private String status;
    private String appliedDate;
    private String deadline;
    private String notes;
    private String userId;

    // Thông tin người liên hệ
    private String contactName;
    private String contactEmail;
    private String contactPhone;

    // Nhãn phân loại
    private List<String> tags;
}