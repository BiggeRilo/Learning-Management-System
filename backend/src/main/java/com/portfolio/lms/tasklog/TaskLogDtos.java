package com.portfolio.lms.tasklog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class TaskLogDtos {

	private TaskLogDtos() {
	}

	public record TaskLogRequest(@NotNull LocalDate date, @NotBlank String category,
			@NotBlank @Size(max = 2000) String description, @NotNull LocalDateTime timeSpent) {
	}

	public record TaskLogResponse(Long id, Long enrollmentId, LocalDate date, String category, String description,
			LocalDateTime timeSpent, LocalDateTime createdAt) {
		public static TaskLogResponse from(TaskLog log) {
			return new TaskLogResponse(log.getId(), log.getEnrollment().getId(), log.getDate(),
					log.getCategory().getCode(), log.getDescription(), log.getTimeSpent(), log.getCreatedAt());
		}
	}
}
