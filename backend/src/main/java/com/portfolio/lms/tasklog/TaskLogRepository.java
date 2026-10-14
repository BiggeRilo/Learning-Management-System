package com.portfolio.lms.tasklog;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskLogRepository extends JpaRepository<TaskLog, Long> {

    @EntityGraph(attributePaths = {"category", "enrollment", "enrollment.student"})
    List<TaskLog> findAllByEnrollmentIdOrderByDateDescCreatedAtDesc(Long enrollmentId);

    @EntityGraph(attributePaths = {"category", "enrollment", "enrollment.student"})
    Optional<TaskLog> findWithRelationsById(Long id);
}
