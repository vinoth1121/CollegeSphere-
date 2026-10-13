# CollegeSphere — Access Control & Permissions Matrix

## 1. Defined Roles
1. `super_admin`: Multi-institutional & platform administrator.
2. `admin`: Institutional Academic Administrator & Registrar.
3. `hod`: Head of Department (scoped to department).
4. `faculty`: Teaching Staff (scoped to assigned courses and classes).
5. `student`: Enrolled Student (scoped to self records).
6. `accounts`: Institutional Finance & Fee Collection Officer.
7. `exam_officer`: Institutional Examination Controller / Registrar of Evaluation.

---

## 2. Resource Permissions Matrix

| Resource / Action | super_admin | admin | hod | faculty | student | accounts | exam_officer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Institutions** | CRUD | R | - | - | - | - | - |
| **Users / Staff Provisioning** | CRUD | CRUD | R (Dept) | - | - | - | - |
| **Departments & Programmes** | CRUD | CRUD | R (Dept) | R | R | R | R |
| **Academic Years & Semesters** | CRUD | CRUD | R | R | R | R | R |
| **Classes & Sections** | CRUD | CRUD | CRUD (Dept) | R (Assigned) | R (Own Class) | - | R |
| **Courses & Catalog** | CRUD | CRUD | CRUD (Dept) | R | R | - | R |
| **Course Offerings** | CRUD | CRUD | CRUD (Dept) | R (Assigned) | R (Enrolled) | - | R |
| **Student Admissions** | CRUD | CRUD | R (Dept) | - | - | - | - |
| **Student Profiles** | CRUD | CRUD | R/U (Dept) | R (Taught) | R (Self) | R | R |
| **Course Enrolment** | CRUD | CRUD | CRUD (Dept) | R (Class) | Self-Register | - | R |
| **Attendance Session Creation** | CRUD | CRUD | CRUD (Dept) | CRUD (Assigned)| - | - | - |
| **Attendance Entry** | CRUD | CRUD | U (Dept) | CRUD (Assigned)| R (Self) | - | - |
| **Attendance Correction Request**| CRUD | CRUD | Approve | Request | Request (Self)| - | - |
| **Examinations Setup** | CRUD | CRUD | R/C (Dept) | R (Assigned) | R (Enrolled) | - | CRUD |
| **Marks Entry (Draft)** | CRUD | Admin | R (Dept) | CRUD (Assigned)| - | - | CRUD |
| **Marks Verification** | - | - | Approve (Dept)| - | - | - | CRUD |
| **Marks Publication** | - | - | - | - | R (Self Pub) | - | CRUD |
| **Fee Structures** | CRUD | CRUD | - | - | R | CRUD | - |
| **Student Invoices** | CRUD | CRUD | - | - | R (Self) | CRUD | - |
| **Payment Recording** | - | - | - | - | - | CRUD | - |
| **Receipt Generation** | CRUD | CRUD | - | - | R (Self) | CRUD | - |
| **Announcements** | CRUD | CRUD | CRUD (Dept) | CRUD (Class) | R | - | CRUD |
| **Documents Upload** | CRUD | CRUD | CRUD (Dept) | U (Assigned) | U (Self) | U (Receipts) | U |
| **Audit Logs** | R | R | - | - | - | - | - |
| **Executive Reports** | Full | Full | Dept Level | Class Level | Transcript | Financial | Exam & Pass |

---

## 3. Strict Boundary Rules
- **Financial Segregation**: Faculty and Exam Officers have ZERO write access to fee structures, invoices, or payments.
- **Grade Protection**: Accounts staff have ZERO write access to assessments, marks, or result publication.
- **Department Boundaries**: An HOD cannot edit courses, faculty, or students belonging to a different department.
- **Class/Course Assignment**: A faculty member cannot record attendance or submit marks for a course offering they are not assigned to.
- **Student Record Isolation**: Students can strictly read only their own profile, enrolled courses, attendance records, verified published grades, and personal invoices/receipts.
