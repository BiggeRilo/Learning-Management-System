package com.portfolio.lms.enrollment;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    @EntityGraph(attributePaths = {"course", "student"})
    List<Enrollment> findAllByStudentIdOrderByEnrolledAtDesc(Long studentId);

    long countByStudentIdAndStatusAndDeadlineAfter(Long studentId, Enrollment.Status status,
                                                   LocalDateTime now);

    boolean existsByStudentIdAndCourseIdAndStatusAndDeadlineAfter(
            Long studentId, Long courseId, Enrollment.Status status, LocalDateTime now);

    boolean existsByCourseId(Long courseId);

    @EntityGraph(attributePaths = {"course", "student"})
    Optional<Enrollment> findWithCourseAndStudentById(Long id);
}
