package com.jobtracker.job_tracker_backend.repository;

import com.jobtracker.job_tracker_backend.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobApplicationRepository extends MongoRepository<JobApplication, String> {
    List<JobApplication> findByUserId(String userId);
}