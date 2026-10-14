package com.portfolio.lms.tasklog;

import com.portfolio.lms.category.TaskCategory;
import com.portfolio.lms.enrollment.Enrollment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_logs")
public class TaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "task_date", nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private TaskCategory category;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(name = "time_spent", nullable = false)
    private LocalDateTime timeSpent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected TaskLog() {
    }

    public TaskLog(Enrollment enrollment, LocalDate date, TaskCategory category,
                   String description, LocalDateTime timeSpent) {
        this.enrollment = enrollment;
        this.date = date;
        this.category = category;
        this.description = description;
        this.timeSpent = timeSpent;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void update(LocalDate date, TaskCategory category, String description,
                       LocalDateTime timeSpent) {
        this.date = date;
        this.category = category;
        this.description = description;
        this.timeSpent = timeSpent;
    }

    public Long getId() {
        return id;
    }

    public Enrollment getEnrollment() {
        return enrollment;
    }

    public LocalDate getDate() {
        return date;
    }

    public TaskCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getTimeSpent() {
        return timeSpent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
