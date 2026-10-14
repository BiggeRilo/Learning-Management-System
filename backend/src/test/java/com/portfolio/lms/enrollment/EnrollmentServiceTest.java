package com.portfolio.lms.enrollment;

import com.portfolio.lms.course.CourseRepository;
import com.portfolio.lms.shared.ApiException;
import com.portfolio.lms.user.User;
import com.portfolio.lms.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private UserRepository userRepository;

    private EnrollmentService enrollmentService;

    @BeforeEach
    void setUp() {
        enrollmentService = new EnrollmentService(enrollmentRepository, courseRepository, userRepository);
    }

    @Test
    void rejectsFourthSimultaneousEnrollment() {
        User student = new User("Ana", "Silva", LocalDate.of(2000, 1, 1),
                "ana@example.com", "11999999999", "hash", User.Role.STUDENT);
        when(userRepository.findByEmailIgnoreCase("ana@example.com")).thenReturn(Optional.of(student));
        when(userRepository.findByIdForUpdate(null)).thenReturn(Optional.of(student));
        when(enrollmentRepository.countByStudentIdAndStatusAndDeadlineAfter(
                any(), any(), any(LocalDateTime.class))).thenReturn(3L);

        assertThatThrownBy(() -> enrollmentService.enroll(
                "ana@example.com", new EnrollmentDtos.EnrollmentRequest(10L)))
                .isInstanceOf(ApiException.class)
                .hasMessage("O estudante já possui três matrículas ativas.");
        verify(courseRepository, never()).findById(any());
    }
}
