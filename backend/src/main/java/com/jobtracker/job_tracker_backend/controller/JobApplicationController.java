package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.dto.JobApplicationRequest;
import com.jobtracker.job_tracker_backend.model.JobApplication;
import com.jobtracker.job_tracker_backend.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository repository;

    @GetMapping("/user/{userId}")
    public List<JobApplication> getByUser(@PathVariable String userId) {
        return repository.findByUserId(userId);
    }

    @PostMapping
    public JobApplication create(@Valid @RequestBody JobApplicationRequest request) {
        JobApplication job = new JobApplication();
        job.setCompany(request.getCompany());
        job.setPosition(request.getPosition());
        job.setStatus(request.getStatus() != null ? request.getStatus() : "APPLIED");
        job.setAppliedDate(request.getAppliedDate());
        job.setDeadline(request.getDeadline());
        job.setNotes(request.getNotes());
        job.setUserId(request.getUserId());
        job.setContactName(request.getContactName());
        job.setContactEmail(request.getContactEmail());
        job.setContactPhone(request.getContactPhone());
        job.setTags(request.getTags());
        return repository.save(job);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> update(@PathVariable String id, @Valid @RequestBody JobApplicationRequest request) {
        return repository.findById(id)
                .map(job -> {
                    job.setCompany(request.getCompany());
                    job.setPosition(request.getPosition());
                    job.setStatus(request.getStatus());
                    job.setAppliedDate(request.getAppliedDate());
                    job.setDeadline(request.getDeadline());
                    job.setNotes(request.getNotes());
                    job.setContactName(request.getContactName());
                    job.setContactEmail(request.getContactEmail());
                    job.setContactPhone(request.getContactPhone());
                    job.setTags(request.getTags());
                    return ResponseEntity.ok(repository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Cập nhật riêng status (dùng cho kéo thả Kanban)
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(@PathVariable String id, @Valid @RequestBody Map<String, String> body) {
        return repository.findById(id)
                .map(job -> {
                    job.setStatus(body.get("status"));
                    return ResponseEntity.ok(repository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // API thống kê — đếm số lượng theo từng status
    @GetMapping("/user/{userId}/stats")
    public Map<String, Long> getStats(@PathVariable String userId) {
        List<JobApplication> jobs = repository.findByUserId(userId);
        return jobs.stream()
                .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));
    }
}