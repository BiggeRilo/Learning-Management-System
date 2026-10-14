package com.portfolio.lms.security;

import com.portfolio.lms.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private JwtEncoder encoder;
    @Mock
    private JwtDecoder decoder;

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService(encoder, decoder, Duration.ofMinutes(15), Duration.ofDays(7));
    }

    @Test
    void encodesAccessTokenWithHs256Header() {
        User user = mock(User.class);
        when(user.getEmail()).thenReturn("ana@example.com");
        when(user.getId()).thenReturn(1L);
        when(user.getRole()).thenReturn(User.Role.STUDENT);
        when(encoder.encode(any())).thenAnswer(invocation -> {
            JwtEncoderParameters parameters = invocation.getArgument(0);
            JwsHeader header = parameters.getJwsHeader();
            assertThat(header.getAlgorithm()).isEqualTo(MacAlgorithm.HS256);
            JwtClaimsSet claims = parameters.getClaims();
            return Jwt.withTokenValue("signed-token")
                    .headers(headers -> headers.putAll(header.getHeaders()))
                    .claims(existing -> existing.putAll(claims.getClaims()))
                    .build();
        });

        String token = tokenService.accessToken(user);

        assertThat(token).isEqualTo("signed-token");
    }
}
