# CollegeSphere — Database Design & Data Dictionary

## 1. Overview
The database name is `college_sphere`. All collections are scoped by an `institutionId` to ensure multi-tenancy readiness while beginning with a single institution.

Referential integrity is maintained at the service and data-access layer. Multi-document ACID transactions are utilized for atomic operations (such as fee payments updating invoices, course enrollment capacity checks, and bulk marks submission).

---

## 2. Collections & Schemas

### 2.1 `institutions`
- `_id`: ObjectId
- `name`: String (e.g. "Imperial College of Engineering & Technology")
- `code`: String (Unique, e.g. "ICET")
- `address`: { street, city, state, postalCode, country }
- `contactDetails`: { email, phone, website }
- `timezone`: String (Default "Asia/Kolkata" or configured UTC offset)
- `currency`: String (Default "INR")
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ code: 1 }` (unique), `{ isActive: 1 }`

### 2.2 `users`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `email`: String (Unique per institution, lowercase, trimmed)
- `passwordHash`: String (bcrypt hash)
- `roles`: [String] (`super_admin`, `admin`, `hod`, `faculty`, `student`, `accounts`, `exam_officer`)
- `permissions`: [String]
- `accountStatus`: String (`active`, `disabled`, `pending_verification`, `suspended`)
- `lastLoginAt`: Date
- `passwordResetToken`: String (hashed)
- `passwordResetExpires`: Date
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, email: 1 }` (unique), `{ roles: 1 }`, `{ accountStatus: 1 }`

### 2.3 `departments`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `departmentCode`: String (e.g. "CSE", "ECE", "MECH")
- `departmentName`: String (e.g. "Computer Science & Engineering")
- `hodUserId`: ObjectId -> `users._id` (Nullable)
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, departmentCode: 1 }` (unique), `{ institutionId: 1, hodUserId: 1 }`

### 2.4 `programmes`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `departmentId`: ObjectId -> `departments._id`
- `programmeCode`: String (e.g. "BTECH-CSE", "MCA")
- `programmeName`: String
- `degreeType`: String (`UG`, `PG`, `DIPLOMA`, `PHD`)
- `durationSemesters`: Number (e.g. 8)
- `isActive`: Boolean
*Indexes*: `{ institutionId: 1, programmeCode: 1 }` (unique), `{ institutionId: 1, departmentId: 1 }`

### 2.5 `academicYears`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `label`: String (e.g. "2025-2026")
- `startDate`: Date
- `endDate`: Date
- `status`: String (`upcoming`, `active`, `completed`, `archived`)
*Indexes*: `{ institutionId: 1, label: 1 }` (unique), `{ institutionId: 1, status: 1 }`

### 2.6 `semesters`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `academicYearId`: ObjectId -> `academicYears._id`
- `semesterNumber`: Number (1 through 10)
- `semesterType`: String (`odd`, `even`, `summer`)
- `startDate`: Date
- `endDate`: Date
- `status`: String (`upcoming`, `active`, `completed`)
*Indexes*: `{ institutionId: 1, academicYearId: 1, semesterNumber: 1 }` (unique)

### 2.7 `classes` (Sections / Batches)
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `programmeId`: ObjectId -> `programmes._id`
- `departmentId`: ObjectId -> `departments._id`
- `academicYearId`: ObjectId -> `academicYears._id`
- `semesterId`: ObjectId -> `semesters._id`
- `className`: String (e.g. "CSE-3A")
- `section`: String (e.g. "A")
- `classAdvisorId`: ObjectId -> `faculty._id`
- `isActive`: Boolean
*Indexes*: `{ institutionId: 1, programmeId: 1, semesterId: 1, section: 1 }` (unique)

### 2.8 `courses`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `courseCode`: String (e.g. "CS301")
- `courseName`: String (e.g. "Database Management Systems")
- `departmentId`: ObjectId -> `departments._id`
- `credits`: Number
- `courseType`: String (`core`, `elective`, `lab`, `project`)
- `isActive`: Boolean
*Indexes*: `{ institutionId: 1, courseCode: 1 }` (unique), `{ departmentId: 1 }`

### 2.9 `students`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `studentNumber`: String (Roll / Register No., unique per institution)
- `userId`: ObjectId -> `users._id` (Nullable until portal access provisioned)
- `programmeId`: ObjectId -> `programmes._id`
- `departmentId`: ObjectId -> `departments._id`
- `admissionAcademicYearId`: ObjectId -> `academicYears._id`
- `currentSemesterId`: ObjectId -> `semesters._id`
- `classId`: ObjectId -> `classes._id`
- `firstName`: String
- `middleName`: String
- `lastName`: String
- `dateOfBirth`: Date
- `gender`: String
- `contact`: { email, phone, address: { street, city, state, postalCode } }
- `guardian`: { name, relation, phone, email }
- `admissionDate`: Date
- `studentStatus`: String (`admitted`, `active`, `graduated`, `suspended`, `withdrawn`)
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, studentNumber: 1 }` (unique), `{ institutionId: 1, departmentId: 1 }`, `{ institutionId: 1, classId: 1 }`, `{ userId: 1 }`

### 2.10 `faculty`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `employeeNumber`: String (Unique per institution)
- `userId`: ObjectId -> `users._id`
- `departmentId`: ObjectId -> `departments._id`
- `firstName`: String
- `lastName`: String
- `designation`: String (e.g. "Professor", "Associate Professor", "Assistant Professor")
- `qualification`: String
- `contact`: { email, phone }
- `assignedSubjects`: [ObjectId -> `courses._id`]
- `employmentStatus`: String (`active`, `on_leave`, `terminated`, `resigned`)
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, employeeNumber: 1 }` (unique), `{ institutionId: 1, departmentId: 1 }`, `{ userId: 1 }`

### 2.11 `courseOfferings`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `courseId`: ObjectId -> `courses._id`
- `academicYearId`: ObjectId -> `academicYears._id`
- `semesterId`: ObjectId -> `semesters._id`
- `classId`: ObjectId -> `classes._id`
- `facultyIds`: [ObjectId -> `faculty._id`]
- `capacity`: Number
- `enrolledCount`: Number (Default 0)
- `registrationStart`: Date
- `registrationEnd`: Date
- `status`: String (`scheduled`, `open`, `in_progress`, `completed`, `cancelled`)
*Indexes*: `{ institutionId: 1, courseId: 1, academicYearId: 1, semesterId: 1, classId: 1 }` (unique)

### 2.12 `enrollments`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `studentId`: ObjectId -> `students._id`
- `courseOfferingId`: ObjectId -> `courseOfferings._id`
- `enrolledAt`: Date
- `status`: String (`enrolled`, `dropped`, `completed`)
- `createdBy`: ObjectId -> `users._id`
*Indexes*: `{ institutionId: 1, studentId: 1, courseOfferingId: 1 }` (unique), `{ courseOfferingId: 1 }`, `{ studentId: 1 }`

### 2.13 `attendanceSessions`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `courseOfferingId`: ObjectId -> `courseOfferings._id`
- `facultyId`: ObjectId -> `faculty._id`
- `sessionDate`: Date (YYYY-MM-DD normalized)
- `startTime`: String (HH:mm)
- `endTime`: String (HH:mm)
- `topic`: String
- `sessionStatus`: String (`conducted`, `cancelled`, `finalized`)
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, courseOfferingId: 1, sessionDate: 1, startTime: 1 }` (unique)

### 2.14 `attendanceRecords`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `attendanceSessionId`: ObjectId -> `attendanceSessions._id`
- `studentId`: ObjectId -> `students._id`
- `status`: String (`present`, `absent`, `late`, `excused`)
- `recordedBy`: ObjectId -> `users._id`
- `recordedAt`: Date
- `correctionHistory`: [{ previousStatus, updatedStatus, reason, correctedBy, correctedAt }]
*Indexes*: `{ institutionId: 1, attendanceSessionId: 1, studentId: 1 }` (unique), `{ studentId: 1, status: 1 }`

### 2.15 `examinations`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `courseOfferingId`: ObjectId -> `courseOfferings._id`
- `examinationName`: String (e.g. "Midterm Assessment 1", "Final Semester Exam")
- `examinationType`: String (`internal`, `midterm`, `final`, `practical`, `assignment`)
- `examDate`: Date
- `maximumMarks`: Number (e.g. 100)
- `passMarks`: Number (e.g. 40)
- `weightagePercentage`: Number
- `status`: String (`scheduled`, `draft_marks`, `verified`, `published`, `cancelled`)
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, courseOfferingId: 1, examinationName: 1 }`

### 2.16 `assessmentResults`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `examinationId`: ObjectId -> `examinations._id`
- `studentId`: ObjectId -> `students._id`
- `marksObtained`: Number
- `grade`: String (`A+`, `A`, `B`, `C`, `D`, `F`)
- `resultStatus`: String (`draft`, `verified`, `published`)
- `enteredBy`: ObjectId -> `users._id`
- `verifiedBy`: ObjectId -> `users._id` (Nullable)
- `verifiedAt`: Date
- `remarks`: String
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, examinationId: 1, studentId: 1 }` (unique)

### 2.17 `feeStructures`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `programmeId`: ObjectId -> `programmes._id`
- `academicYearId`: ObjectId -> `academicYears._id`
- `feeComponents`: [{ name, amount, isOptional }]
- `totalAmount`: Number
- `currency`: String
- `effectiveFrom`: Date
- `effectiveTo`: Date
- `status`: String (`active`, `archived`)
*Indexes*: `{ institutionId: 1, programmeId: 1, academicYearId: 1 }` (unique)

### 2.18 `studentInvoices`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `invoiceNumber`: String (Unique, e.g. "INV-2026-0001")
- `studentId`: ObjectId -> `students._id`
- `academicYearId`: ObjectId -> `academicYears._id`
- `feeComponents`: [{ name, amount }]
- `totalAmount`: Number
- `paidAmount`: Number (Default 0)
- `balanceAmount`: Number
- `dueDate`: Date
- `status`: String (`unpaid`, `partially_paid`, `paid`, `overdue`, `cancelled`)
- `createdAt`, `updatedAt`: Timestamps
*Indexes*: `{ institutionId: 1, invoiceNumber: 1 }` (unique), `{ studentId: 1, status: 1 }`

### 2.19 `payments`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `receiptNumber`: String (Unique, e.g. "REC-2026-0001")
- `invoiceId`: ObjectId -> `studentInvoices._id`
- `studentId`: ObjectId -> `students._id`
- `amount`: Number
- `currency`: String
- `paymentMethod`: String (`cash`, `bank_transfer`, `cheque`, `online`)
- `paymentReference`: String
- `paymentStatus`: String (`completed`, `failed`, `refunded`, `reversed`)
- `receivedBy`: ObjectId -> `users._id`
- `receivedAt`: Date
- `notes`: String
*Indexes*: `{ institutionId: 1, receiptNumber: 1 }` (unique), `{ invoiceId: 1 }`, `{ studentId: 1 }`

### 2.20 `announcements`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `title`: String
- `body`: String
- `audience`: [String] (`all`, `students`, `faculty`, `hod`, `department`)
- `departmentIds`: [ObjectId -> `departments._id`]
- `publishedBy`: ObjectId -> `users._id`
- `publishedAt`: Date
- `expiresAt`: Date
- `status`: String (`draft`, `published`, `archived`)
*Indexes*: `{ institutionId: 1, status: 1, publishedAt: -1 }`

### 2.21 `documents`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `ownerType`: String (`student`, `faculty`, `institution`, `course`)
- `ownerId`: ObjectId
- `documentType`: String (`identity_proof`, `admission_slip`, `syllabus`, `transfer_certificate`, `receipt`)
- `storageKey`: String (Randomized safe UUID file path)
- `originalFilename`: String
- `contentType`: String
- `fileSize`: Number
- `uploadedBy`: ObjectId -> `users._id`
- `createdAt`: Date
*Indexes*: `{ institutionId: 1, ownerType: 1, ownerId: 1 }`

### 2.22 `auditLogs`
- `_id`: ObjectId
- `institutionId`: ObjectId -> `institutions._id`
- `actorUserId`: ObjectId -> `users._id`
- `actorRole`: String
- `action`: String (e.g. `STUDENT_ADMITTED`, `ATTENDANCE_RECORDED`, `MARKS_PUBLISHED`, `PAYMENT_RECEIVED`)
- `resourceType`: String (e.g. `students`, `attendance`, `examinations`, `payments`)
- `resourceId`: ObjectId
- `timestamp`: Date
- `requestId`: String
- `ipAddress`: String
- `metadata`: Object (Sanitized context, excluding passwords/tokens/cards)
- `outcome`: String (`SUCCESS`, `FAILURE`, `DENIED`)
*Indexes*: `{ institutionId: 1, timestamp: -1 }`, `{ actorUserId: 1 }`, `{ resourceType: 1, resourceId: 1 }`
