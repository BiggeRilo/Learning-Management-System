CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX uk_users_email_lower ON users (LOWER(email));

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX uk_courses_name_lower ON courses (LOWER(name));

CREATE TABLE task_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL
);

CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    enrolled_at TIMESTAMP NOT NULL,
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
    CHECK (deadline = enrolled_at + INTERVAL '6 months')
);

CREATE INDEX idx_enrollments_student ON enrollments (student_id);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_enrollments_active ON enrollments (student_id, status, deadline);

CREATE TABLE task_logs (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    task_date DATE NOT NULL,
    category_id BIGINT NOT NULL REFERENCES task_categories(id) ON DELETE RESTRICT,
    description VARCHAR(2000) NOT NULL,
    time_spent TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CHECK (time_spent::date = task_date),
    CHECK (
        time_spent::time > TIME '00:00:00'
        AND EXTRACT(MINUTE FROM time_spent) IN (0, 30)
        AND EXTRACT(SECOND FROM time_spent) = 0
    )
);

CREATE INDEX idx_task_logs_enrollment_date ON task_logs (enrollment_id, task_date DESC);

INSERT INTO task_categories (code, display_name) VALUES
    ('PESQUISA', 'Pesquisa'),
    ('PRATICA', 'Prática'),
    ('ASSISTIR_VIDEOAULA', 'Assistir videoaula');
