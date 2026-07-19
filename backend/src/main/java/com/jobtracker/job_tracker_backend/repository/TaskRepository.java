package com.jobtracker.job_tracker_backend.repository;

import com.jobtracker.job_tracker_backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserId(String userId);
    List<Task> findByJobApplicationId(String jobApplicationId);
}