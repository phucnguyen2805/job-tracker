package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.dto.InterviewNoteRequest;
import com.jobtracker.job_tracker_backend.model.InterviewNote;
import com.jobtracker.job_tracker_backend.repository.InterviewNoteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/interview-notes")
public class InterviewNoteController {

    @Autowired
    private InterviewNoteRepository repository;

    @GetMapping("/job/{jobApplicationId}")
    public List<InterviewNote> getByJob(@PathVariable String jobApplicationId) {
        return repository.findByJobApplicationIdOrderByInterviewDateDesc(jobApplicationId);
    }

    @PostMapping
    public InterviewNote create(@Valid @RequestBody InterviewNoteRequest request, Authentication authentication) {
        InterviewNote note = new InterviewNote();
        note.setJobApplicationId(request.getJobApplicationId());
        note.setUserId(authentication.getName());
        note.setInterviewDate(request.getInterviewDate());
        note.setRating(request.getRating());
        note.setNotes(request.getNotes());
        note.setCreatedAt(Instant.now());
        return repository.save(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public List<InterviewNote> getByUser(@PathVariable String userId) {
        return repository.findByUserId(userId);
    }
}