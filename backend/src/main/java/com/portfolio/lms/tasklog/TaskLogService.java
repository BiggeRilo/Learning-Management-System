package com.portfolio.lms.tasklog;

import com.portfolio.lms.category.TaskCategory;
import com.portfolio.lms.category.TaskCategoryRepository;
import com.portfolio.lms.enrollment.Enrollment;
import com.portfolio.lms.enrollment.EnrollmentService;
import com.portfolio.lms.shared.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

import static com.portfolio.lms.tasklog.TaskLogDtos.TaskLogRequest;
import static com.portfolio.lms.tasklog.TaskLogDtos.TaskLogResponse;

@Service
public class TaskLogService {

    private final TaskLogRepository taskLogRepository;
    private final TaskCategoryRepository categoryRepository;
    private final EnrollmentService enrollmentService;

    public TaskLogService(TaskLogRepository taskLogRepository,
                          TaskCategoryRepository categoryRepository,
                          EnrollmentService enrollmentService) {
        this.taskLogRepository = taskLogRepository;
        this.categoryRepository = categoryRepository;
        this.enrollmentService = enrollmentService;
    }

    @Transactional(readOnly = true)
    public List<TaskLogResponse> list(Long enrollmentId, String email) {
        enrollmentService.findOwned(enrollmentId, email);
        return taskLogRepository.findAllByEnrollmentIdOrderByDateDescCreatedAtDesc(enrollmentId).stream()
                .map(TaskLogResponse::from)
                .toList();
    }

    @Transactional
    public TaskLogResponse create(Long enrollmentId, String email, TaskLogRequest request) {
        Enrollment enrollment = enrollmentService.findOwned(enrollmentId, email);
        validate(request, enrollment);
        TaskCategory category = findCategory(request.category());
        TaskLog log = new TaskLog(enrollment, request.date(), category,
                request.description().trim(), request.timeSpent());
        return TaskLogResponse.from(taskLogRepository.save(log));
    }

    @Transactional
    public TaskLogResponse update(Long logId, String email, TaskLogRequest request) {
        TaskLog log = findOwnedLog(logId, email);
        validate(request, log.getEnrollment());
        log.update(request.date(), findCategory(request.category()),
                request.description().trim(), request.timeSpent());
        return TaskLogResponse.from(log);
    }

    @Transactional
    public void delete(Long logId, String email) {
        taskLogRepository.delete(findOwnedLog(logId, email));
    }

    private TaskLog findOwnedLog(Long id, String email) {
        TaskLog log = taskLogRepository.findWithRelationsById(id)
                .orElseThrow(() -> ApiException.notFound("Log de tarefa não encontrado."));
        if (!log.getEnrollment().getStudent().getEmail().equalsIgnoreCase(email)) {
            throw ApiException.forbidden("Este log pertence a outro estudante.");
        }
        return log;
    }

    private TaskCategory findCategory(String code) {
        return categoryRepository.findByCode(code.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> ApiException.unprocessable("Categoria de tarefa inválida."));
    }

    private void validate(TaskLogRequest request, Enrollment enrollment) {
        LocalDateTime timeSpent = request.timeSpent();
        LocalTime duration = timeSpent.toLocalTime();
        boolean validIncrement = duration.getSecond() == 0
                && duration.getNano() == 0
                && duration.getMinute() % 30 == 0;
        if (!validIncrement || duration.equals(LocalTime.MIDNIGHT)) {
            throw ApiException.unprocessable(
                    "O tempo gasto deve ser maior que zero e informado em incrementos de 30 minutos.");
        }
        if (!timeSpent.toLocalDate().equals(request.date())) {
            throw ApiException.unprocessable("A data codificada no tempo gasto deve coincidir com a tarefa.");
        }
        if (request.date().isBefore(enrollment.getEnrolledAt().toLocalDate())
                || request.date().isAfter(enrollment.getDeadline().toLocalDate())) {
            throw ApiException.unprocessable("A tarefa deve estar dentro do período da matrícula.");
        }
    }
}
