package com.portfolio.lms.enrollment;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.portfolio.lms.enrollment.EnrollmentDtos.EnrollmentRequest;
import static com.portfolio.lms.enrollment.EnrollmentDtos.EnrollmentResponse;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/students/me/enrollments")
    List<EnrollmentResponse> listMine(@AuthenticationPrincipal Jwt jwt) {
        return enrollmentService.listMine(jwt.getSubject());
    }

    @PostMapping("/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    EnrollmentResponse enroll(@AuthenticationPrincipal Jwt jwt,
                              @Valid @RequestBody EnrollmentRequest request) {
        return enrollmentService.enroll(jwt.getSubject(), request);
    }
}
