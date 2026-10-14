package com.portfolio.lms.enrollment;

import com.portfolio.lms.course.Course;
import com.portfolio.lms.course.CourseRepository;
import com.portfolio.lms.shared.ApiException;
import com.portfolio.lms.user.User;
import com.portfolio.lms.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.portfolio.lms.enrollment.EnrollmentDtos.EnrollmentRequest;
import static com.portfolio.lms.enrollment.EnrollmentDtos.EnrollmentResponse;

@Service
public class EnrollmentService {

    private static final int MAX_ACTIVE_ENROLLMENTS = 3;

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository,
                             UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> listMine(String email) {
        User student = findUser(email);
        return enrollmentRepository.findAllByStudentIdOrderByEnrolledAtDesc(student.getId()).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    @Transactional
    public EnrollmentResponse enroll(String email, EnrollmentRequest request) {
        User current = findUser(email);
        User student = userRepository.findByIdForUpdate(current.getId())
                .orElseThrow(() -> ApiException.notFound("Estudante não encontrado."));
        if (student.getRole() != User.Role.STUDENT) {
            throw ApiException.forbidden("Apenas estudantes podem se matricular.");
        }

        LocalDateTime now = LocalDateTime.now();
        long activeCount = enrollmentRepository.countByStudentIdAndStatusAndDeadlineAfter(
                student.getId(), Enrollment.Status.ACTIVE, now);
        if (activeCount >= MAX_ACTIVE_ENROLLMENTS) {
            throw ApiException.unprocessable("O estudante já possui três matrículas ativas.");
        }
        if (enrollmentRepository.existsByStudentIdAndCourseIdAndStatusAndDeadlineAfter(
                student.getId(), request.courseId(), Enrollment.Status.ACTIVE, now)) {
            throw ApiException.conflict("O estudante já está matriculado neste curso.");
        }

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ApiException.notFound("Curso não encontrado."));
        return EnrollmentResponse.from(enrollmentRepository.save(new Enrollment(student, course, now)));
    }

    @Transactional(readOnly = true)
    public Enrollment findOwned(Long enrollmentId, String email) {
        Enrollment enrollment = enrollmentRepository.findWithCourseAndStudentById(enrollmentId)
                .orElseThrow(() -> ApiException.notFound("Matrícula não encontrada."));
        if (!enrollment.getStudent().getEmail().equalsIgnoreCase(email)) {
            throw ApiException.forbidden("Esta matrícula pertence a outro estudante.");
        }
        return enrollment;
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("Usuário não encontrado."));
    }
}
