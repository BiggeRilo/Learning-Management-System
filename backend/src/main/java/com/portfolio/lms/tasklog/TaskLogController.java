package com.portfolio.lms.tasklog;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.portfolio.lms.tasklog.TaskLogDtos.TaskLogRequest;
import static com.portfolio.lms.tasklog.TaskLogDtos.TaskLogResponse;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('STUDENT')")
public class TaskLogController {

    private final TaskLogService taskLogService;

    public TaskLogController(TaskLogService taskLogService) {
        this.taskLogService = taskLogService;
    }

    @GetMapping("/enrollments/{enrollmentId}/logs")
    List<TaskLogResponse> list(@PathVariable Long enrollmentId,
                               @AuthenticationPrincipal Jwt jwt) {
        return taskLogService.list(enrollmentId, jwt.getSubject());
    }

    @PostMapping("/enrollments/{enrollmentId}/logs")
    @ResponseStatus(HttpStatus.CREATED)
    TaskLogResponse create(@PathVariable Long enrollmentId,
                           @AuthenticationPrincipal Jwt jwt,
                           @Valid @RequestBody TaskLogRequest request) {
        return taskLogService.create(enrollmentId, jwt.getSubject(), request);
    }

    @PutMapping("/logs/{logId}")
    TaskLogResponse update(@PathVariable Long logId,
                           @AuthenticationPrincipal Jwt jwt,
                           @Valid @RequestBody TaskLogRequest request) {
        return taskLogService.update(logId, jwt.getSubject(), request);
    }

    @DeleteMapping("/logs/{logId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable Long logId, @AuthenticationPrincipal Jwt jwt) {
        taskLogService.delete(logId, jwt.getSubject());
    }
}
