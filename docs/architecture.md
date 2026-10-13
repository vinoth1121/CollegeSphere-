# CollegeSphere — System Architecture Document

## 1. Executive Summary & Purpose
CollegeSphere is an institutional-grade, multi-role web platform designed to streamline and govern academic, administrative, and financial workflows in higher education institutions. It provides a multi-tenant ready, single-institution foundation supporting students, faculty, heads of departments (HODs), academic administrators, examination officers, and finance officers.

## 2. High-Level System Architecture

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (BROWSER)                             |
|  React 18 / 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack   |
|  - Role-aware navigation & dynamic layouts                                    |
|  - Client-side validation with React Hook Form + Zod                          |
|  - Client-side state caching & optimistic UI updates                          |
+-------------------------------------------------------------------------------+
                                      |
                                      | HTTPS / REST API (JSON)
                                      v
+-------------------------------------------------------------------------------+
|                            API GATEWAY / REST API                             |
|  Node.js LTS + Express.js + TypeScript (CommonJS/ESM Serverless Compatible)   |
|  - Security Middleware: Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanit |
|  - Authentication: JWT HttpOnly / Bearer tokens + Argon2/Bcrypt password hash |
|  - Authorization: RBAC Middleware & Fine-grained Permission Matrix Checks      |
|  - Request Validation: Express-Validator / Zod                                |
|  - Audit Logging Middleware: Intercepts mutations & logs non-sensitive audit   |
|  - Centralized Error Handler: Consistent error responses, sanitizing traces   |
+-------------------------------------------------------------------------------+
       |                    |                    |                   |
       v                    v                    v                   v
+--------------+    +--------------+    +--------------+    +---------------+
| Auth Service |    | Academic Svc |    | Exam Service |    | Fee & Finance |
| Student Svc  |    | Timetable    |    | Attendance   |    | Reports & Doc |
+--------------+    +--------------+    +--------------+    +---------------+
       \                    \                    /                  /
        +----------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                           DATA ACCESS LAYER (DAL)                             |
|  MongoDB Node.js Driver / Mongoose ODM with Schema Validation & Indexes       |
|  - Unit of Work / Transactions for Multi-document Writes                      |
|  - Compound & Unique Tenant-Scoped Indexes                                    |
|  - Optimized Aggregation Pipelines for Analytics & Reports                   |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                             PERSISTENCE TIER                                  |
|  MongoDB Atlas / MongoDB Replica Set                                          |
|  - `college_sphere` Database                                                  |
|  - 22 Core Collections with Tenant Scoping (`institutionId`)                  |
+-------------------------------------------------------------------------------+
```

## 3. Technology Stack Breakdown

### Frontend
- **Framework**: React 18 / 19 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom academic palette and accessible contrast
- **Router**: React Router v6 / v7 with protected routes and role-based guards
- **Forms & Validation**: React Hook Form with Zod schemas
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **HTTP Client**: Axios with interceptors for token attachment and 401 handling

### Backend
- **Runtime**: Node.js LTS (v20+ / v24+)
- **Framework**: Express.js with TypeScript
- **Serverless Adapter**: Compatible with Vercel Serverless Functions (`api/index.ts`)
- **Security**:
  - `helmet`: Secure HTTP headers (CSP, HSTS, X-Frame-Options)
  - `cors`: Strict origin allowlists
  - `express-rate-limit`: Brute-force protection for login and sensitive mutations
  - `bcryptjs`: Password hashing with high work factor
  - `jsonwebtoken`: Dual token structure (short-lived access tokens, refresh tokens)
- **Validation**: Strict schema-based request validation (`express-validator` / `zod`)
- **Logging**: Structured JSON logging with Winston / Pino style logger

### Database & Storage
- **Database**: MongoDB Atlas / MongoDB 7+ Replica Set
- **Database Driver**: Mongoose with strict schema definitions, hooks, and index declarations
- **Transactions**: Multi-document ACID transactions for critical financial and enrollment workflows
- **Document Storage**: Metadata in MongoDB, file payload abstraction (local secure upload with randomized keys / S3-compatible cloud storage)

## 4. Key Architectural Decisions & Non-Negotiables
1. **Multi-Tenancy Readiness**: Every institutional collection includes `institutionId: ObjectId`. Indexes are compounded with `institutionId` to enable seamless future multi-institutional scaling without data leaks.
2. **Never Trust Client Data**: All IDs, roles, amounts, and marks are verified against database state, never trusted from client payloads.
3. **Immutability of Financial and Academic Records**:
   - Attendance sessions are finalized and can only be amended via audit-logged correction requests.
   - Marks are drafted, verified, published, and cannot be modified by students or unassigned faculty.
   - Payments generate unique receipt numbers and create ledger-like transaction entries.
4. **Vercel Serverless Compatibility**:
   - Connection caching across warm function invocations (`cached.conn`).
   - No long-running unmanaged intervals; tasks are triggered or event-driven.
   - Clean export of `app` for Vercel Functions.

## 5. System Modules
1. **Identity & Access Management (IAM)**: Registration, login, password recovery, session validation, RBAC.
2. **Institutional Structure**: Institutions, departments, programmes, academic years, semesters, classes.
3. **Academic Catalog & Enrollment**: Courses, course offerings, student enrollment, capacity validation.
4. **Student Information System (SIS)**: Admissions, student demographics, enrollment history, student profiles.
5. **Faculty Management**: Faculty directory, department allocation, course assignments.
6. **Attendance Management**: Session creation, roster generation, bulk attendance recording, percentage computation, correction workflows.
7. **Examinations & Grading**: Exam scheduling, grading policies, marks entry, verification, grade sheet generation.
8. **Fee Management & Finance**: Fee structures, invoicing, payment recording, receipt generation, outstanding balance tracking.
9. **Role-Based Portals**:
   - Super Admin & College Admin
   - Head of Department (HOD)
   - Faculty
   - Student
   - Accounts Officer
   - Examination Controller
10. **Audit & Compliance**: Centralized audit log tracking actor, IP, timestamp, action, and target entity.
