package com.jobtracker.job_tracker_backend.repository;

import com.jobtracker.job_tracker_backend.model.InterviewNote;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InterviewNoteRepository extends MongoRepository<InterviewNote, String> {
    List<InterviewNote> findByJobApplicationIdOrderByInterviewDateDesc(String jobApplicationId);
    List<InterviewNote> findByUserId(String userId);
}