package com.portfolio.lms.security;

import com.portfolio.lms.shared.ApiException;
import com.portfolio.lms.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class TokenService {

    private static final String ACCESS_TOKEN_TYPE = "access";
	private static final String REFRESH_TOKEN_TYPE = "refresh";
	private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public TokenService(JwtEncoder encoder, @Qualifier("rawJwtDecoder") JwtDecoder decoder,
                        @Value("${app.jwt.access-ttl:PT15M}") Duration accessTtl,
                        @Value("${app.jwt.refresh-ttl:P7D}") Duration refreshTtl) {
        this.encoder = encoder;
        this.decoder = decoder;
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    public String accessToken(User user) {
        return createToken(user, ACCESS_TOKEN_TYPE, accessTtl);
    }

    public String refreshToken(User user) {
        return createToken(user, REFRESH_TOKEN_TYPE, refreshTtl);
    }

    public String validateRefreshAndGetSubject(String token) {
        try {
            Jwt jwt = decoder.decode(token);
            if (!REFRESH_TOKEN_TYPE.equals(jwt.getClaimAsString("type"))) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token inválido.");
            }
            return jwt.getSubject();
        } catch (ApiException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token inválido ou expirado.");
        }
    }

    private String createToken(User user, String type, Duration ttl) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("teste-tecnico-act")
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(ttl))
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("type", type)
                .build();
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }
}
