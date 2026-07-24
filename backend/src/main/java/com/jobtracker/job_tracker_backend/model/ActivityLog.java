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
@Document(collection = "activity_logs")
public class ActivityLog {
    @Id
    private String id;
    private String jobApplicationId;
    private String userId;
    private String action;       // CREATED, STATUS_CHANGED
    private String fromStatus;
    private String toStatus;
    private String description;
    private Instant timestamp;
}