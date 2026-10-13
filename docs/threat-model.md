# CollegeSphere — Threat Model & Security Controls

## 1. Threat Profile & Assets
Assets at risk:
1. **Academic Integrity**: Grades, assessment marks, transcripts, and attendance records.
2. **Financial Transactions**: Student tuition fees, payments, balances, receipts.
3. **Personal Identifiable Information (PII)**: Student dates of birth, contact numbers, parent details, addresses.
4. **Access Credentials**: Passwords, JWT secrets, database connection URIs.

---

## 2. Threat Analysis (STRIDE Model)

| Threat | Risk Scenario | Applied Defense Mechanism |
| :--- | :--- | :--- |
| **Spoofing** | Attacker impersonating student or faculty | Strong password hashing (bcrypt salt 10+), secure JWT tokens with expiry, brute-force rate limiting on `/auth/login`. |
| **Tampering** | Student tampering with marks or attendance | Strict RBAC middleware checking token claims & DB assignment, transactional mark submission, verification before publishing. |
| **Repudiation** | Faculty denies entering incorrect marks or changing attendance | Comprehensive immutable `auditLogs` recording actor ID, IP, timestamp, action type, and before/after metadata. |
| **Information Disclosure** | Student fetching other students' records or unverified marks | Endpoint-level ownership check (`req.user.studentId === targetStudentId` or administrative role required). |
| **Denial of Service** | Flooding API with automated requests or huge payloads | `express-rate-limit` (100 req/15min default, 5 req/15min for auth), body parser size limits (1mb for JSON, 10mb for uploads). |
| **Elevation of Privilege** | Student modifying payload role to `admin` | Roles are never accepted from registration or profile update payloads; role changes restricted to verified `admin` endpoints. |

---

## 3. Application Security Hardening Checklist
- [x] Helmet headers enabled (CSP, HSTS, noSniff, frameguard).
- [x] CORS restricted to verified frontend origin.
- [x] Express Mongo Sanitize / input sanitization against NoSQL injection (`$gt`, `$ne`, `$where`).
- [x] Parameterized / ODM queries only, zero string concatenation into DB queries.
- [x] Error handling masks internal DB error codes, stacks, and cluster names in production.
- [x] Sensitive tokens and passwords scrubbed from audit logs and application logs.
- [x] Environment variable isolation for all secrets (`MONGODB_URI`, `JWT_SECRET`).
