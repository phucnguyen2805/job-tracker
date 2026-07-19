package com.jobtracker.job_tracker_backend.repository;

import com.jobtracker.job_tracker_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}