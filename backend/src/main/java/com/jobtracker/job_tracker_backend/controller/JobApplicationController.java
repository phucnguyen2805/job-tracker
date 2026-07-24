package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.dto.JobApplicationRequest;
import com.jobtracker.job_tracker_backend.model.ActivityLog;
import com.jobtracker.job_tracker_backend.model.JobApplication;
import com.jobtracker.job_tracker_backend.repository.ActivityLogRepository;
import com.jobtracker.job_tracker_backend.repository.JobApplicationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jobtracker.job_tracker_backend.dto.MockInterviewRequest;
import com.jobtracker.job_tracker_backend.service.AiService;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.jobtracker.job_tracker_backend.service.FileUploadService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private JobApplicationRepository repository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private AiService aiService;

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
        JobApplication saved = repository.save(job);

        logActivity(saved.getId(), saved.getUserId(), "CREATED", null, saved.getStatus(),
                "Đã tạo đơn ứng tuyển tới " + saved.getCompany());

        return saved;
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
                    job.setResumeUrl(request.getResumeUrl());
                    job.setResumeFileName(request.getResumeFileName());
                    return ResponseEntity.ok(repository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return repository.findById(id)
                .map(job -> {
                    String oldStatus = job.getStatus();
                    String newStatus = body.get("status");
                    job.setStatus(newStatus);
                    JobApplication saved = repository.save(job);

                    logActivity(saved.getId(), saved.getUserId(), "STATUS_CHANGED", oldStatus, newStatus,
                            "Chuyển trạng thái từ " + statusLabel(oldStatus) + " sang " + statusLabel(newStatus));

                    return ResponseEntity.ok(saved);
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

    @GetMapping("/user/{userId}/stats")
    public Map<String, Long> getStats(@PathVariable String userId) {
        List<JobApplication> jobs = repository.findByUserId(userId);
        return jobs.stream()
                .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));
    }

    @GetMapping("/{id}/activity")
    public List<ActivityLog> getActivity(@PathVariable String id) {
        return activityLogRepository.findByJobApplicationIdOrderByTimestampDesc(id);
    }

    private void logActivity(String jobApplicationId, String userId, String action,
                             String fromStatus, String toStatus, String description) {
        ActivityLog log = new ActivityLog();
        log.setJobApplicationId(jobApplicationId);
        log.setUserId(userId);
        log.setAction(action);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setDescription(description);
        log.setTimestamp(Instant.now());
        activityLogRepository.save(log);
    }

    private String statusLabel(String status) {
        if (status == null) return "?";
        return switch (status) {
            case "APPLIED" -> "Đã ứng tuyển";
            case "INTERVIEWING" -> "Đang phỏng vấn";
            case "OFFER" -> "Nhận offer";
            case "REJECTED" -> "Bị từ chối";
            default -> status;
        };
    }

    @PostMapping("/{id}/mock-interview")
    public ResponseEntity<Map<String, List<String>>> generateMockInterview(
            @PathVariable String id,
            @RequestBody(required = false) MockInterviewRequest request,
            Authentication authentication) {

        String userId = authentication.getName(); // Lấy từ JWT (đã set trong JwtAuthFilter)

        JobApplication job = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển"));

        String jd = (request != null) ? request.getJobDescription() : null;
        List<String> questions = aiService.generateMockInterviewQuestions(userId, job.getCompany(), job.getPosition(), jd);

        return ResponseEntity.ok(Map.of("questions", questions));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<Map<String, String>> uploadResume(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {

        JobApplication job = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển"));

        // Giới hạn kích thước file: tối đa 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File quá lớn, vui lòng chọn file dưới 5MB");
        }

        String url = fileUploadService.uploadFile(file);
        job.setResumeUrl(url);
        job.setResumeFileName(file.getOriginalFilename());
        repository.save(job);

        Map<String, String> response = new HashMap<>();
        response.put("resumeUrl", url);
        response.put("resumeFileName", file.getOriginalFilename());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/resume")
    public ResponseEntity<Void> deleteResume(@PathVariable String id) {
        JobApplication job = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển"));

        job.setResumeUrl(null);
        job.setResumeFileName(null);
        repository.save(job);

        return ResponseEntity.noContent().build();
    }
}