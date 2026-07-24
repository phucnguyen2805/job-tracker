package com.jobtracker.job_tracker_backend.repository;

import com.jobtracker.job_tracker_backend.model.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findByJobApplicationIdOrderByTimestampDesc(String jobApplicationId);
}