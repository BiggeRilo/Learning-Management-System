package com.portfolio.lms.auth;

import com.portfolio.lms.user.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String firstName,
            @NotBlank @Size(max = 100) String lastName,
            @NotNull @Past LocalDate birthDate,
            @NotBlank @Email @Size(max = 320) String email,
            @NotBlank @Size(max = 30) String phone,
            @NotBlank @Size(min = 8, max = 72) String password
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    public record UserResponse(
            Long id,
            String firstName,
            String lastName,
            LocalDate birthDate,
            String email,
            String phone,
            User.Role role,
            LocalDateTime createdAt
    ) {
        public static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(),
                    user.getBirthDate(), user.getEmail(), user.getPhone(), user.getRole(),
                    user.getCreatedAt());
        }
    }

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            UserResponse user
    ) {
    }
}
