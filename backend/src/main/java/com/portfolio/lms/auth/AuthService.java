package com.portfolio.lms.auth;

import com.portfolio.lms.security.TokenService;
import com.portfolio.lms.shared.ApiException;
import com.portfolio.lms.user.User;
import com.portfolio.lms.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;

import static com.portfolio.lms.auth.AuthDtos.AuthResponse;
import static com.portfolio.lms.auth.AuthDtos.LoginRequest;
import static com.portfolio.lms.auth.AuthDtos.RefreshRequest;
import static com.portfolio.lms.auth.AuthDtos.RegisterRequest;
import static com.portfolio.lms.auth.AuthDtos.UserResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (Period.between(request.birthDate(), LocalDate.now()).getYears() < 16) {
            throw ApiException.unprocessable("O estudante deve ter pelo menos 16 anos.");
        }

        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Já existe um usuário cadastrado com este e-mail.");
        }

        User user = userRepository.save(new User(
                request.firstName().trim(),
                request.lastName().trim(),
                request.birthDate(),
                email,
                request.phone().trim(),
                passwordEncoder.encode(request.password()),
                User.Role.STUDENT
        ));
        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(this::invalidCredentials);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshRequest request) {
        String email = tokenService.validateRefreshAndGetSubject(request.refreshToken());
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Usuário inválido."));
        return tokensFor(user);
    }

    private AuthResponse tokensFor(User user) {
        return new AuthResponse(tokenService.accessToken(user), tokenService.refreshToken(user),
                "Bearer", UserResponse.from(user));
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
