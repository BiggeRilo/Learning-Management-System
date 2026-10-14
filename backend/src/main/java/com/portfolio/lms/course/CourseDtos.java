package com.portfolio.lms.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class CourseDtos {

    private CourseDtos() {
    }

    public record CourseRequest(
            @NotBlank @Size(max = 200) String name,
            @NotBlank @Size(max = 2000) String description
    ) {
    }

    public record CourseResponse(
            Long id,
            String name,
            String description,
            LocalDateTime createdAt
    ) {
        public static CourseResponse from(Course course) {
            return new CourseResponse(course.getId(), course.getName(), course.getDescription(),
                    course.getCreatedAt());
        }
    }
}
