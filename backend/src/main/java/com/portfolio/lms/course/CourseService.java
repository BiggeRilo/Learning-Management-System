package com.portfolio.lms.course;

import com.portfolio.lms.enrollment.EnrollmentRepository;
import com.portfolio.lms.shared.ApiException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.portfolio.lms.course.CourseDtos.CourseRequest;
import static com.portfolio.lms.course.CourseDtos.CourseResponse;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> list() {
        return courseRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(CourseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse get(Long id) {
        return CourseResponse.from(find(id));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        String name = request.name().trim();
        ensureUniqueName(name, null);
        return CourseResponse.from(courseRepository.save(new Course(name, request.description().trim())));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = find(id);
        String name = request.name().trim();
        ensureUniqueName(name, id);
        course.update(name, request.description().trim());
        return CourseResponse.from(course);
    }

    @Transactional
    public void delete(Long id) {
        Course course = find(id);
        if (enrollmentRepository.existsByCourseId(id)) {
            throw ApiException.conflict("O curso possui matrículas e não pode ser removido.");
        }
        courseRepository.delete(course);
    }

    private Course find(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Curso não encontrado."));
    }

    private void ensureUniqueName(String name, Long currentId) {
        boolean exists = currentId == null
                ? courseRepository.existsByNameIgnoreCase(name)
                : courseRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (exists) {
            throw ApiException.conflict("Já existe um curso com este nome.");
        }
    }
}
