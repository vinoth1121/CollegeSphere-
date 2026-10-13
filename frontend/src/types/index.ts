export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'hod'
  | 'faculty'
  | 'student'
  | 'accounts'
  | 'exam_officer';

export interface User {
  _id: string;
  institutionId: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  accountStatus: 'active' | 'disabled' | 'pending_verification' | 'suspended';
  lastLoginAt?: string;
  profile?: any;
}

export interface Department {
  _id: string;
  departmentCode: string;
  departmentName: string;
  hodUserId?: { _id: string; email: string };
  isActive: boolean;
}

export interface Programme {
  _id: string;
  departmentId: Department;
  programmeCode: string;
  programmeName: string;
  degreeType: 'UG' | 'PG' | 'DIPLOMA' | 'PHD';
  durationSemesters: number;
  isActive: boolean;
}

export interface AcademicYear {
  _id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
}

export interface Semester {
  _id: string;
  academicYearId: string;
  semesterNumber: number;
  semesterType: 'odd' | 'even' | 'summer';
  status: 'upcoming' | 'active' | 'completed';
}

export interface ClassSection {
  _id: string;
  className: string;
  section: string;
  programmeId: Programme;
  departmentId: Department;
  semesterId: Semester;
}

export interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseType: 'core' | 'elective' | 'lab' | 'project';
  departmentId: Department;
  isActive: boolean;
}

export interface CourseOffering {
  _id: string;
  courseId: Course;
  academicYearId: AcademicYear;
  semesterId: Semester;
  classId?: ClassSection;
  facultyIds: Array<{ _id: string; firstName: string; lastName: string; employeeNumber: string }>;
  capacity: number;
  enrolledCount: number;
  status: 'scheduled' | 'open' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Student {
  _id: string;
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  departmentId: Department;
  programmeId: Programme;
  classId?: ClassSection;
  currentSemesterId: Semester;
  contact: {
    email: string;
    phone?: string;
    address?: { street?: string; city?: string; state?: string; postalCode?: string };
  };
  guardian?: { name?: string; relation?: string; phone?: string; email?: string };
  admissionDate: string;
  studentStatus: 'admitted' | 'active' | 'graduated' | 'suspended' | 'withdrawn';
  metrics?: {
    attendancePercentage: number;
    totalAttendanceSessions: number;
    presentAttendanceSessions: number;
    totalOutstandingDues: number;
  };
}

export interface Faculty {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  designation: string;
  qualification?: string;
  departmentId: Department;
  contact: { email: string; phone?: string };
  assignedSubjects?: Course[];
  employmentStatus: 'active' | 'on_leave' | 'terminated' | 'resigned';
}

export interface AttendanceSession {
  _id: string;
  courseOfferingId: CourseOffering;
  facultyId: Faculty;
  sessionDate: string;
  startTime: string;
  endTime: string;
  topic?: string;
  sessionStatus: 'conducted' | 'cancelled' | 'finalized';
}

export interface AttendanceRecord {
  _id: string;
  studentId: { _id: string; studentNumber: string; firstName: string; lastName: string };
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedAt: string;
  correctionHistory?: Array<{
    previousStatus: string;
    updatedStatus: string;
    reason: string;
    correctedAt: string;
  }>;
}

export interface Examination {
  _id: string;
  courseOfferingId: CourseOffering;
  examinationName: string;
  examinationType: 'internal' | 'midterm' | 'final' | 'practical' | 'assignment';
  examDate: string;
  maximumMarks: number;
  passMarks: number;
  weightagePercentage?: number;
  status: 'scheduled' | 'draft_marks' | 'verified' | 'published' | 'cancelled';
}

export interface AssessmentResult {
  _id: string;
  examinationId: Examination;
  studentId: Student;
  marksObtained: number;
  grade?: string;
  resultStatus: 'draft' | 'verified' | 'published';
  remarks?: string;
}

export interface FeeStructure {
  _id: string;
  programmeId: Programme;
  academicYearId: AcademicYear;
  feeComponents: Array<{ name: string; amount: number; isOptional: boolean }>;
  totalAmount: number;
  currency: string;
}

export interface StudentInvoice {
  _id: string;
  invoiceNumber: string;
  studentId: Student;
  academicYearId: AcademicYear;
  feeComponents: Array<{ name: string; amount: number }>;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
}

export interface Payment {
  _id: string;
  receiptNumber: string;
  invoiceId: StudentInvoice;
  studentId: Student;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  paymentReference?: string;
  paymentStatus: 'completed' | 'failed' | 'refunded' | 'reversed';
  receivedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  audience: string[];
  publishedBy: { email: string };
  publishedAt: string;
}

export interface AuditLog {
  _id: string;
  actorUserId?: { email: string };
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  metadata?: any;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
}
