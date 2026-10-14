package com.portfolio.lms.auth;

import com.portfolio.lms.security.TokenService;
import com.portfolio.lms.shared.ApiException;
import com.portfolio.lms.user.UserRepository;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TokenService tokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, tokenService);
    }
    
    @Test
    void rejectsStudentsYoungerThanSixteen() {
        AuthDtos.RegisterRequest request = new AuthDtos.RegisterRequest(
                "Ana", "Silva", LocalDate.now().minusYears(16).plusDays(1),
                "ana@example.com", "11999999999", "Password123!"
        );

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ApiException.class)
                .hasMessage("O estudante deve ter pelo menos 16 anos.");
        verifyNoInteractions(userRepository, passwordEncoder, tokenService);
    }
}
