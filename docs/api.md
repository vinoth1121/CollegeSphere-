# CollegeSphere — REST API Specification (`/api/v1`)

## 1. API Conventions

### Base URL
All API endpoints are prefixed with:
`/api/v1`

### Consistent Response Envelope
All responses return standardized JSON:
```json
// Success Response (HTTP 200/201)
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}

// Error Response (HTTP 400/401/403/404/422/500)
{
  "success": false,
  "message": "Validation failed / Unauthorized / Not found",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 2. Core Endpoint Catalog

### Authentication & Self (`/api/v1/auth`)
- `POST /auth/login` — Authenticate user and issue JWT token + user payload.
- `POST /auth/logout` — Invalidate session.
- `GET /auth/me` — Retrieve current authenticated user profile, roles, and permissions.
- `POST /auth/change-password` — Change password with current password verification.
- `POST /auth/forgot-password` — Request password reset link/token.
- `POST /auth/reset-password` — Complete password reset with token.

### Institutional Hierarchy (`/api/v1/institution`)
- `GET /institution` — Get institution profile.
- `PATCH /institution` — Update institution configuration (Admin only).
- `GET /departments` / `POST /departments` / `PATCH /departments/:id`
- `GET /programmes` / `POST /programmes` / `PATCH /programmes/:id`
- `GET /academic-years` / `POST /academic-years` / `PATCH /academic-years/:id`
- `GET /semesters` / `POST /semesters` / `PATCH /semesters/:id`
- `GET /classes` / `POST /classes` / `PATCH /classes/:id`

### Academic Catalog & Enrollment (`/api/v1/academic`)
- `GET /courses` / `POST /courses` / `PATCH /courses/:id`
- `GET /course-offerings` / `POST /course-offerings` / `PATCH /course-offerings/:id`
- `GET /enrollments` / `POST /enrollments` / `PATCH /enrollments/:id`

### Students & Admissions (`/api/v1/students`)
- `GET /students` — Filterable, paginated student directory.
- `POST /students` — Admit new student (generates student record + optional user login).
- `GET /students/:id` — Detailed student profile (demographics, enrollment, attendance, dues).
- `PATCH /students/:id` — Update student profile.
- `POST /students/:id/status` — Change status (active, suspended, graduated).

### Faculty Management (`/api/v1/faculty`)
- `GET /faculty` — Paginated directory of faculty members.
- `POST /faculty` — Onboard new faculty member.
- `GET /faculty/:id` — Faculty profile & assigned course offerings.
- `PATCH /faculty/:id` — Update faculty profile / department / designation.

### Attendance Management (`/api/v1/attendance`)
- `POST /attendance/sessions` — Create attendance session for a course offering.
- `GET /attendance/sessions` — List sessions with date and offering filters.
- `GET /attendance/sessions/:id` — Get session roster and recorded attendance.
- `POST /attendance/sessions/:id/records` — Submit bulk attendance (present, absent, late, excused).
- `POST /attendance/records/:id/correct` — Request/submit correction with reason.
- `GET /attendance/student/:studentId` — Student-specific attendance report & percentage.
- `GET /attendance/summary` — Aggregate attendance analytics.

### Examinations & Grading (`/api/v1/examinations`)
- `GET /examinations` — List scheduled examinations.
- `POST /examinations` — Schedule new assessment (max marks, pass marks, weightage).
- `GET /examinations/:id/results` — Get entered marks for students.
- `POST /examinations/:id/results` — Bulk enter or draft marks (assigned faculty/exam officer).
- `POST /examinations/:id/verify` — Verify assessment results (HOD/exam officer).
- `POST /examinations/:id/publish` — Publish results to students (exam officer).
- `GET /examinations/student/:studentId` — Transcript and published results for student.

### Fees & Accounting (`/api/v1/fees`)
- `GET /fees/structures` / `POST /fees/structures` — Manage tuition fee structures.
- `GET /fees/invoices` / `POST /fees/invoices` — List and generate student invoices.
- `GET /fees/invoices/:id` — Get invoice details and transaction ledger.
- `POST /fees/payments` — Record payment against invoice with receipt generation.
- `GET /fees/receipts/:id` — Download or view official payment receipt.
- `GET /fees/reports/summary` — Financial collection summary & outstanding balances.

### Dashboards & Analytics (`/api/v1/dashboard`)
- `GET /dashboard/admin` — Total students, faculty, departments, collection, attendance trends.
- `GET /dashboard/faculty` — Assigned offerings, today's schedule, pending marks, low attendance alerts.
- `GET /dashboard/student` — Enrolled courses, attendance summary, published results, fee dues.
- `GET /dashboard/accounts` — Monthly collection, pending dues, recent receipts.

### Audit & System (`/api/v1/audit`)
- `GET /audit/logs` — Paginated, filterable immutable audit logs (Admin only).
- `GET /health` — Health check status (DB connection, uptime, memory, version).
