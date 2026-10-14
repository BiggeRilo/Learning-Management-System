package com.portfolio.lms.tasklog;

import com.portfolio.lms.category.TaskCategoryRepository;
import com.portfolio.lms.enrollment.Enrollment;
import com.portfolio.lms.enrollment.EnrollmentService;
import com.portfolio.lms.shared.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskLogServiceTest {

    @Mock
    private TaskLogRepository taskLogRepository;
    @Mock
    private TaskCategoryRepository categoryRepository;
    @Mock
    private EnrollmentService enrollmentService;

    private TaskLogService taskLogService;

    @BeforeEach
    void setUp() {
        taskLogService = new TaskLogService(taskLogRepository, categoryRepository, enrollmentService);
    }

    @Test
    void rejectsTimeThatIsNotAMultipleOfThirtyMinutes() {
        Enrollment enrollment = mock(Enrollment.class);
        when(enrollmentService.findOwned(1L, "student@example.com")).thenReturn(enrollment);
        TaskLogDtos.TaskLogRequest request = new TaskLogDtos.TaskLogRequest(
                LocalDate.of(2026, 2, 1),
                "PESQUISA",
                "Leitura",
                LocalDateTime.of(2026, 2, 1, 1, 45)
        );

        assertThatThrownBy(() -> taskLogService.create(1L, "student@example.com", request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("incrementos de 30 minutos");
    }
}
