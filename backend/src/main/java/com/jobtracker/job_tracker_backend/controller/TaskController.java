package com.jobtracker.job_tracker_backend.controller;

import com.jobtracker.job_tracker_backend.dto.TaskRequest;
import com.jobtracker.job_tracker_backend.model.Task;
import com.jobtracker.job_tracker_backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Task createTask(@Valid @RequestBody TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");
        task.setDueDate(request.getDueDate());
        task.setJobApplicationId(request.getJobApplicationId());
        task.setUserId(request.getUserId());
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @Valid @RequestBody TaskRequest request) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setTitle(request.getTitle());
                    task.setDescription(request.getDescription());
                    task.setStatus(request.getStatus());
                    task.setDueDate(request.getDueDate());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public List<Task> getTasksByUserId(@PathVariable String userId) {
        return taskRepository.findByUserId(userId);
    }

    @GetMapping("/job/{jobApplicationId}")
    public List<Task> getTasksByJobApplication(@PathVariable String jobApplicationId) {
        return taskRepository.findByJobApplicationId(jobApplicationId);
    }
}