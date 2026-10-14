package com.portfolio.lms.enrollment;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class EnrollmentDtos {

    private EnrollmentDtos() {
    }

    public record EnrollmentRequest(@NotNull Long courseId) {
    }

    public record EnrollmentResponse(
            Long id,
            Long courseId,
            String courseName,
            String courseDescription,
            Long studentId,
            LocalDateTime enrolledAt,
            LocalDateTime deadline
    ) {
        public static EnrollmentResponse from(Enrollment enrollment) {
            return new EnrollmentResponse(
                    enrollment.getId(),
                    enrollment.getCourse().getId(),
                    enrollment.getCourse().getName(),
                    enrollment.getCourse().getDescription(),
                    enrollment.getStudent().getId(),
                    enrollment.getEnrolledAt(),
                    enrollment.getDeadline()
            );
        }
    }
}
