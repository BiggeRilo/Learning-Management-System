# Learning Management System (LMS)

A full-stack Learning Management System built with **Java 25**, **Spring Boot 4.1.0**, and **Angular 22**. This project demonstrates modern backend and frontend development practices including REST API design, JWT authentication, role-based authorization, and responsive UI components.

## Problem Solved

This LMS addresses the need for a structured learning platform where:
- **Students** can browse courses, enroll (max 3 concurrent), track progress with time-logged activities in 30-minute increments, and manage their learning journey within 6-month deadlines
- **Administrators** can manage the course catalog (CRUD operations) with unique name constraints
- **Both roles** benefit from secure JWT-based authentication with access/refresh token rotation and role-based authorization

## Architecture

```text
.
├── backend/   Spring Boot 4.1.0, Java 25, Maven, PostgreSQL, Docker
└── frontend/  Angular 22, Angular Material, TypeScript, Vitest
```

## Tech Stack

### Backend
- **Java 25** (latest)
- **Spring Boot 4.1.0** (latest)
- **Spring Security** with OAuth2 Resource Server (JWT)
- **Spring Data JPA** with Hibernate
- **Flyway** for database migrations
- **PostgreSQL** (production) / H2 (testing)
- **Testcontainers** for integration testing
- **SpringDoc OpenAPI** for API documentation
- **Maven** for build management

### Frontend
- **Angular 22** (Standalone Components)
- **Angular Material** for UI components
- **TypeScript** with strict mode
- **RxJS** for reactive programming
- **Vitest** for unit testing
- **ESLint** + **Prettier** for code quality

## Features

### Authentication & Authorization
- User registration with validation (minimum age 16, unique email)
- JWT-based authentication with access/refresh tokens
- Role-based access control (Student, Admin)
- Secure password hashing with BCrypt

### Course Management (Admin)
- Create, read, update, delete courses
- Course listing with search and pagination
- Unique course name constraint

### Enrollment System (Student)
- Browse available courses
- Enroll in courses (max 3 active enrollments)
- 6-month enrollment deadline tracking
- Enrollment status management (Active, Completed, Expired)

### Task Logging
- Log learning activities with categories (Research, Practice, Video)
- Time tracking in 30-minute increments
- Task history per enrollment
- Category management with relational persistence

## Getting Started

### Prerequisites
- Java 25+
- Node.js 20+
- Docker & Docker Compose (for database)
- Maven 3.9+ (or use included wrapper)

### Backend Setup

```bash
cd backend

# Start PostgreSQL with Docker
docker compose up -d postgres

# Run the application
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health Check: `http://localhost:8080/actuator/health`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200` (proxies `/api` to backend)

### Full Stack with Docker

```bash
# From root directory
docker compose -f backend/docker-compose.yml up --build
```

## Project Structure

### Backend (`backend/src/main/java/com/portfolio/lms`)
```
├── auth/           # Authentication controllers, DTOs, services
├── category/       # Task category entities and repositories
├── course/         # Course management (CRUD, search)
├── enrollment/     # Student enrollment logic
├── security/       # JWT config, token services, security filters
├── shared/         # Global exception handling, API exceptions
├── tasklog/        # Task logging CRUD and validation
├── user/           # User entity, repository, admin initialization
└── LmsApplication  # Spring Boot entry point
```

### Frontend (`frontend/src/app`)
```
├── core/                    # Guards, interceptors, services, layout
│   ├── guards/              # Auth, Admin, Student route guards
│   ├── http/                # HTTP interceptors, options
│   ├── layout/              # Main layout component
│   └── services/            # Auth, Course, Enrollment, TaskLog services
├── features/                # Feature modules (lazy-loaded)
│   ├── auth/                # Login, Register pages
│   ├── courses/             # Course list, detail, admin management
│   └── enrollments/         # My courses, course logs
└── shared/                  # Shared components, models, utilities
    ├── components/          # Reusable UI components
    ├── models/              # TypeScript interfaces
    ├── utils/               # Date, category utilities
    └── validators/          # Custom form validators
```

## API Documentation

Complete OpenAPI 3.0 specification available at:
- **Live Swagger UI**: `http://localhost:8080/swagger-ui.html` (when backend running)
- **OpenAPI Spec**: `docs/openapi.yaml`
- **Detailed Endpoint Guide**: `docs/API.md`

## Testing

### Backend
```bash
cd backend
./mvnw test              # Unit tests
./mvnw verify            # Integration tests (requires Docker)
```

### Frontend
```bash
cd frontend
npm test                 # Unit tests with Vitest
npm run lint             # ESLint + Prettier check
```

## Configuration

### Backend (`backend/src/main/resources/application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/lms
    username: lms
    password: lms
  jpa:
    hibernate:
      ddl-auto: validate

app:
  jwt:
    secret: ${JWT_SECRET}           # Min 32 chars
    access-ttl: PT15M               # 15 minutes
    refresh-ttl: P7D                # 7 days
    issuer: lms-portfolio
  cors:
    allowed-origins: http://localhost:4200
  admin:
    enabled: true
    email: admin@lms.local
    password: ChangeMe123!
```

### Frontend (`frontend/src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: '/api'
};
```

## Database Schema

The database is initialized via Flyway migrations (`V1__create_lms_schema.sql`):
- `users` - Students and admins
- `courses` - Course catalog
- `task_categories` - Predefined task types
- `enrollments` - Student-course relationships with deadlines
- `task_logs` - Learning activity records

## Deployment

### Docker Production Build
```bash
# Build backend image
cd backend && ./mvnw package -DskipTests
docker build -t lms-backend .

# Build frontend image
cd frontend && npm run build
docker build -t lms-frontend .

# Deploy with docker-compose
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)
| Variable | Description | Required |
|----------|-------------|----------|
| `DB_URL` | PostgreSQL JDBC URL | Yes |
| `DB_USERNAME` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | Min 32-char secret for token signing | Yes |
| `JWT_ISSUER` | Token issuer (default: lms-portfolio) | No |
| `CORS_ALLOWED_ORIGINS` | Frontend URL (default: http://localhost:4200) | No |
| `ADMIN_EMAIL` | Initial admin email | No |
| `ADMIN_PASSWORD` | Initial admin password | No |

## License

This project is part of a personal portfolio demonstrating full-stack development capabilities.