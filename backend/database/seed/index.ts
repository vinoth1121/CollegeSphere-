import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../../src/config/db';
import {
  Institution,
  User,
  Department,
  Programme,
  AcademicYear,
  Semester,
  Class,
  Course,
  Faculty,
  Student,
  CourseOffering,
  Enrollment,
  AttendanceSession,
  AttendanceRecord,
  Examination,
  AssessmentResult,
  FeeStructure,
  StudentInvoice,
  Payment,
  Announcement,
  AuditLog,
} from '../../src/models';
import { logger } from '../../src/utils/logger';

export async function runSeed(dropExisting: boolean = true) {
  try {
    await connectDB();
    logger.info('Database connected. Starting seed operation...');

    if (dropExisting) {
      logger.info('Clearing existing collections...');
      await Promise.all([
        Institution.deleteMany({}),
        User.deleteMany({}),
        Department.deleteMany({}),
        Programme.deleteMany({}),
        AcademicYear.deleteMany({}),
        Semester.deleteMany({}),
        Class.deleteMany({}),
        Course.deleteMany({}),
        Faculty.deleteMany({}),
        Student.deleteMany({}),
        CourseOffering.deleteMany({}),
        Enrollment.deleteMany({}),
        AttendanceSession.deleteMany({}),
        AttendanceRecord.deleteMany({}),
        Examination.deleteMany({}),
        AssessmentResult.deleteMany({}),
        FeeStructure.deleteMany({}),
        StudentInvoice.deleteMany({}),
        Payment.deleteMany({}),
        Announcement.deleteMany({}),
        AuditLog.deleteMany({}),
      ]);
    }

    // 1. Institution
    const institution = await Institution.create({
      name: 'Imperial College of Engineering & Technology',
      code: 'ICET',
      address: {
        street: '42 Knowledge Boulevard, Tech Park Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
      },
      contactDetails: {
        email: 'info@collegesphere.edu',
        phone: '+91-80-23456789',
        website: 'https://collegesphere.edu',
      },
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      isActive: true,
    });
    const instId = institution._id;
    logger.info(`Created Institution: ${institution.name} (${institution.code})`);

    // Common password hash for test accounts: "Password@123"
    const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

    // 2. Users for all roles
    const adminUser = await User.create({
      institutionId: instId,
      email: 'admin@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['admin'],
      permissions: ['*'],
      accountStatus: 'active',
    });

    const hodUser = await User.create({
      institutionId: instId,
      email: 'hod.cse@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['hod', 'faculty'],
      permissions: ['department:manage', 'attendance:approve', 'results:verify'],
      accountStatus: 'active',
    });

    const facultyUser = await User.create({
      institutionId: instId,
      email: 'faculty.cse@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['faculty'],
      permissions: ['attendance:record', 'results:enter'],
      accountStatus: 'active',
    });

    const studentUser1 = await User.create({
      institutionId: instId,
      email: 'student.arun@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['student'],
      permissions: ['self:read'],
      accountStatus: 'active',
    });

    const studentUser2 = await User.create({
      institutionId: instId,
      email: 'student.priya@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['student'],
      permissions: ['self:read'],
      accountStatus: 'active',
    });

    const accountsUser = await User.create({
      institutionId: instId,
      email: 'accounts@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['accounts'],
      permissions: ['fees:manage', 'payments:record', 'invoices:create'],
      accountStatus: 'active',
    });

    const examUser = await User.create({
      institutionId: instId,
      email: 'exam@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['exam_officer'],
      permissions: ['examinations:manage', 'results:verify', 'results:publish'],
      accountStatus: 'active',
    });

    const facultyAidsUser = await User.create({
      institutionId: instId,
      email: 'faculty.aids@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['faculty'],
      permissions: ['attendance:record', 'results:enter'],
      accountStatus: 'active',
    });

    const facultyEceUser = await User.create({
      institutionId: instId,
      email: 'faculty.ece@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['faculty'],
      permissions: ['attendance:record', 'results:enter'],
      accountStatus: 'active',
    });

    const facultyMechUser = await User.create({
      institutionId: instId,
      email: 'faculty.mech@collegesphere.edu',
      passwordHash: defaultPasswordHash,
      roles: ['faculty'],
      permissions: ['attendance:record', 'results:enter'],
      accountStatus: 'active',
    });
    logger.info('Created baseline users for all roles and departmental faculties.');

    // 3. Departments (6 Engineering Departments)
    const deptCse = await Department.create({
      institutionId: instId,
      departmentCode: 'CSE',
      departmentName: 'Computer Science & Engineering',
      hodUserId: hodUser._id,
      isActive: true,
    });

    const deptAids = await Department.create({
      institutionId: instId,
      departmentCode: 'AIDS',
      departmentName: 'Artificial Intelligence & Data Science',
      isActive: true,
    });

    const deptEce = await Department.create({
      institutionId: instId,
      departmentCode: 'ECE',
      departmentName: 'Electronics & Communication Engineering',
      isActive: true,
    });

    const deptMech = await Department.create({
      institutionId: instId,
      departmentCode: 'MECH',
      departmentName: 'Mechanical & Robotics Engineering',
      isActive: true,
    });

    const deptCivil = await Department.create({
      institutionId: instId,
      departmentCode: 'CIVIL',
      departmentName: 'Civil & Environmental Engineering',
      isActive: true,
    });

    const deptBio = await Department.create({
      institutionId: instId,
      departmentCode: 'BIOTECH',
      departmentName: 'Biotechnology & Biomedical Engineering',
      isActive: true,
    });
    logger.info('Created 6 Engineering Departments (CSE, AIDS, ECE, MECH, CIVIL, BIOTECH).');

    // 4. Programmes
    const progBtechCse = await Programme.create({
      institutionId: instId,
      departmentId: deptCse._id,
      programmeCode: 'BTECH-CSE',
      programmeName: 'Bachelor of Technology in Computer Science',
      degreeType: 'UG',
      durationSemesters: 8,
      isActive: true,
    });

    const progBtechAids = await Programme.create({
      institutionId: instId,
      departmentId: deptAids._id,
      programmeCode: 'BTECH-AIDS',
      programmeName: 'Bachelor of Technology in AI & Data Science',
      degreeType: 'UG',
      durationSemesters: 8,
      isActive: true,
    });

    const progBtechEce = await Programme.create({
      institutionId: instId,
      departmentId: deptEce._id,
      programmeCode: 'BTECH-ECE',
      programmeName: 'Bachelor of Technology in Electronics & Communication',
      degreeType: 'UG',
      durationSemesters: 8,
      isActive: true,
    });

    const progBtechMech = await Programme.create({
      institutionId: instId,
      departmentId: deptMech._id,
      programmeCode: 'BTECH-MECH',
      programmeName: 'Bachelor of Technology in Mechanical Engineering',
      degreeType: 'UG',
      durationSemesters: 8,
      isActive: true,
    });

    // 5. Academic Years & Semesters
    const ay2025 = await AcademicYear.create({
      institutionId: instId,
      label: '2025-2026',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      status: 'active',
    });

    const sem5 = await Semester.create({
      institutionId: instId,
      academicYearId: ay2025._id,
      semesterNumber: 5,
      semesterType: 'odd',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-12-15'),
      status: 'active',
    });

    const sem6 = await Semester.create({
      institutionId: instId,
      academicYearId: ay2025._id,
      semesterNumber: 6,
      semesterType: 'even',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-05-30'),
      status: 'upcoming',
    });

    // 6. Faculty (Distinguished Professors & Instructors)
    const faculty1 = await Faculty.create({
      institutionId: instId,
      employeeNumber: 'FAC-CSE-001',
      userId: hodUser._id,
      departmentId: deptCse._id,
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. in Computer Science (IISc)',
      contact: { email: 'hod.cse@collegesphere.edu', phone: '+91-9876543210' },
      employmentStatus: 'active',
    });

    const faculty2 = await Faculty.create({
      institutionId: instId,
      employeeNumber: 'FAC-CSE-002',
      userId: facultyUser._id,
      departmentId: deptCse._id,
      firstName: 'Prof. Sneha',
      lastName: 'Sharma',
      designation: 'Associate Professor',
      qualification: 'M.Tech in Cloud & Distributed Computing',
      contact: { email: 'faculty.cse@collegesphere.edu', phone: '+91-9876543211' },
      employmentStatus: 'active',
    });

    const faculty3 = await Faculty.create({
      institutionId: instId,
      employeeNumber: 'FAC-AIDS-001',
      userId: facultyAidsUser._id,
      departmentId: deptAids._id,
      firstName: 'Dr. Vikram',
      lastName: 'Sengupta',
      designation: 'Professor & AI Research Director',
      qualification: 'Ph.D. in Neural Networks (IIT Madras)',
      contact: { email: 'faculty.aids@collegesphere.edu', phone: '+91-9876543212' },
      employmentStatus: 'active',
    });

    const faculty4 = await Faculty.create({
      institutionId: instId,
      employeeNumber: 'FAC-ECE-001',
      userId: facultyEceUser._id,
      departmentId: deptEce._id,
      firstName: 'Dr. Ananya',
      lastName: 'Deshmukh',
      designation: 'Professor',
      qualification: 'Ph.D. in VLSI & Embedded Systems',
      contact: { email: 'faculty.ece@collegesphere.edu', phone: '+91-9876543213' },
      employmentStatus: 'active',
    });

    const faculty5 = await Faculty.create({
      institutionId: instId,
      employeeNumber: 'FAC-MECH-001',
      userId: facultyMechUser._id,
      departmentId: deptMech._id,
      firstName: 'Prof. Rohan',
      lastName: 'Kulkarni',
      designation: 'Assistant Professor',
      qualification: 'M.Tech in Robotics & Mechatronics',
      contact: { email: 'faculty.mech@collegesphere.edu', phone: '+91-9876543214' },
      employmentStatus: 'active',
    });

    // 7. Classes
    const classCse3A = await Class.create({
      institutionId: instId,
      programmeId: progBtechCse._id,
      departmentId: deptCse._id,
      academicYearId: ay2025._id,
      semesterId: sem5._id,
      className: 'CSE-3A',
      section: 'A',
      classAdvisorId: faculty1._id,
      isActive: true,
    });

    const classAids2A = await Class.create({
      institutionId: instId,
      programmeId: progBtechAids._id,
      departmentId: deptAids._id,
      academicYearId: ay2025._id,
      semesterId: sem5._id,
      className: 'AIDS-3A',
      section: 'A',
      classAdvisorId: faculty3._id,
      isActive: true,
    });

    // 8. Courses
    const courseDbms = await Course.create({
      institutionId: instId,
      departmentId: deptCse._id,
      courseCode: 'CS501',
      courseName: 'Database Management Systems & Distributed Storage',
      credits: 4,
      courseType: 'core',
      isActive: true,
    });

    const courseOs = await Course.create({
      institutionId: instId,
      departmentId: deptCse._id,
      courseCode: 'CS502',
      courseName: 'Operating Systems & Kernel Architecture',
      credits: 4,
      courseType: 'core',
      isActive: true,
    });

    const courseWeb = await Course.create({
      institutionId: instId,
      departmentId: deptCse._id,
      courseCode: 'CS503',
      courseName: 'Modern Web Engineering & Cloud Native DevOps',
      credits: 3,
      courseType: 'elective',
      isActive: true,
    });

    const courseAi = await Course.create({
      institutionId: instId,
      departmentId: deptAids._id,
      courseCode: 'AI501',
      courseName: 'Deep Learning & Computer Vision Foundations',
      credits: 4,
      courseType: 'core',
      isActive: true,
    });

    const courseNlp = await Course.create({
      institutionId: instId,
      departmentId: deptAids._id,
      courseCode: 'AI502',
      courseName: 'Natural Language Processing & Generative Models',
      credits: 3,
      courseType: 'elective',
      isActive: true,
    });

    faculty1.assignedSubjects = [courseDbms._id as any];
    await faculty1.save();
    faculty2.assignedSubjects = [courseOs._id as any, courseWeb._id as any];
    await faculty2.save();
    faculty3.assignedSubjects = [courseAi._id as any, courseNlp._id as any];
    await faculty3.save();

    // 9. Students Roster (Expanded 12 Students with Profiles)
    const student1 = await Student.create({
      institutionId: instId,
      studentNumber: '2023CSE001',
      userId: studentUser1._id,
      programmeId: progBtechCse._id,
      departmentId: deptCse._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classCse3A._id,
      firstName: 'Arun',
      lastName: 'Kumar',
      gender: 'male',
      dateOfBirth: new Date('2004-05-14'),
      contact: {
        email: 'student.arun@collegesphere.edu',
        phone: '+91-9123456780',
        address: { street: '12 Green Park, Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038' },
      },
      guardian: { name: 'S. Kumar', relation: 'Father', phone: '+91-9123456789' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student2 = await Student.create({
      institutionId: instId,
      studentNumber: '2023CSE002',
      userId: studentUser2._id,
      programmeId: progBtechCse._id,
      departmentId: deptCse._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classCse3A._id,
      firstName: 'Priya',
      lastName: 'Nair',
      gender: 'female',
      dateOfBirth: new Date('2004-11-20'),
      contact: {
        email: 'student.priya@collegesphere.edu',
        phone: '+91-9123456781',
        address: { street: '45 Palm Avenue, Koramangala', city: 'Bengaluru', state: 'Karnataka', postalCode: '560034' },
      },
      guardian: { name: 'R. Nair', relation: 'Mother', phone: '+91-9123456790' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student3 = await Student.create({
      institutionId: instId,
      studentNumber: '2023CSE003',
      programmeId: progBtechCse._id,
      departmentId: deptCse._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classCse3A._id,
      firstName: 'Rahul',
      lastName: 'Verma',
      gender: 'male',
      dateOfBirth: new Date('2004-02-10'),
      contact: {
        email: 'rahul.verma@collegesphere.edu',
        phone: '+91-9123456782',
        address: { street: '77 Silicon Valley Layout', city: 'Bengaluru', state: 'Karnataka', postalCode: '560100' },
      },
      guardian: { name: 'M. Verma', relation: 'Father', phone: '+91-9123456791' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student4 = await Student.create({
      institutionId: instId,
      studentNumber: '2023CSE004',
      programmeId: progBtechCse._id,
      departmentId: deptCse._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classCse3A._id,
      firstName: 'Snehal',
      lastName: 'Patel',
      gender: 'female',
      dateOfBirth: new Date('2004-07-22'),
      contact: { email: 'snehal.patel@collegesphere.edu', phone: '+91-9123456783' },
      guardian: { name: 'K. Patel', relation: 'Father', phone: '+91-9123456792' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student5 = await Student.create({
      institutionId: instId,
      studentNumber: '2023CSE005',
      programmeId: progBtechCse._id,
      departmentId: deptCse._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classCse3A._id,
      firstName: 'Aditya',
      lastName: 'Iyer',
      gender: 'male',
      dateOfBirth: new Date('2004-09-18'),
      contact: { email: 'aditya.iyer@collegesphere.edu', phone: '+91-9123456784' },
      guardian: { name: 'V. Iyer', relation: 'Father', phone: '+91-9123456793' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student6 = await Student.create({
      institutionId: instId,
      studentNumber: '2023AIDS001',
      programmeId: progBtechAids._id,
      departmentId: deptAids._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classAids2A._id,
      firstName: 'Zoya',
      lastName: 'Mirza',
      gender: 'female',
      dateOfBirth: new Date('2004-03-30'),
      contact: { email: 'zoya.mirza@collegesphere.edu', phone: '+91-9123456785' },
      guardian: { name: 'T. Mirza', relation: 'Mother', phone: '+91-9123456794' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student7 = await Student.create({
      institutionId: instId,
      studentNumber: '2023AIDS002',
      programmeId: progBtechAids._id,
      departmentId: deptAids._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classAids2A._id,
      firstName: 'Kavya',
      lastName: 'Reddy',
      gender: 'female',
      dateOfBirth: new Date('2004-12-05'),
      contact: { email: 'kavya.reddy@collegesphere.edu', phone: '+91-9123456786' },
      guardian: { name: 'P. Reddy', relation: 'Father', phone: '+91-9123456795' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });

    const student8 = await Student.create({
      institutionId: instId,
      studentNumber: '2023AIDS003',
      programmeId: progBtechAids._id,
      departmentId: deptAids._id,
      admissionAcademicYearId: ay2025._id,
      currentSemesterId: sem5._id,
      classId: classAids2A._id,
      firstName: 'Varun',
      lastName: 'Chopra',
      gender: 'male',
      dateOfBirth: new Date('2004-06-12'),
      contact: { email: 'varun.chopra@collegesphere.edu', phone: '+91-9123456787' },
      guardian: { name: 'A. Chopra', relation: 'Father', phone: '+91-9123456796' },
      admissionDate: new Date('2023-08-01'),
      studentStatus: 'active',
    });
    logger.info('Created 8 Students across CSE and AI/DS programmes.');

    // 10. Course Offerings & Enrollments
    const offeringDbms = await CourseOffering.create({
      institutionId: instId,
      courseId: courseDbms._id,
      academicYearId: ay2025._id,
      semesterId: sem5._id,
      classId: classCse3A._id,
      facultyIds: [faculty1._id],
      capacity: 60,
      enrolledCount: 5,
      status: 'in_progress',
    });

    const offeringOs = await CourseOffering.create({
      institutionId: instId,
      courseId: courseOs._id,
      academicYearId: ay2025._id,
      semesterId: sem5._id,
      classId: classCse3A._id,
      facultyIds: [faculty2._id],
      capacity: 60,
      enrolledCount: 5,
      status: 'in_progress',
    });

    const offeringAi = await CourseOffering.create({
      institutionId: instId,
      courseId: courseAi._id,
      academicYearId: ay2025._id,
      semesterId: sem5._id,
      classId: classAids2A._id,
      facultyIds: [faculty3._id],
      capacity: 60,
      enrolledCount: 3,
      status: 'in_progress',
    });

    await Enrollment.create([
      { institutionId: instId, studentId: student1._id, courseOfferingId: offeringDbms._id, status: 'enrolled' },
      { institutionId: instId, studentId: student2._id, courseOfferingId: offeringDbms._id, status: 'enrolled' },
      { institutionId: instId, studentId: student3._id, courseOfferingId: offeringDbms._id, status: 'enrolled' },
      { institutionId: instId, studentId: student4._id, courseOfferingId: offeringDbms._id, status: 'enrolled' },
      { institutionId: instId, studentId: student5._id, courseOfferingId: offeringDbms._id, status: 'enrolled' },

      { institutionId: instId, studentId: student1._id, courseOfferingId: offeringOs._id, status: 'enrolled' },
      { institutionId: instId, studentId: student2._id, courseOfferingId: offeringOs._id, status: 'enrolled' },
      { institutionId: instId, studentId: student3._id, courseOfferingId: offeringOs._id, status: 'enrolled' },
      { institutionId: instId, studentId: student4._id, courseOfferingId: offeringOs._id, status: 'enrolled' },
      { institutionId: instId, studentId: student5._id, courseOfferingId: offeringOs._id, status: 'enrolled' },

      { institutionId: instId, studentId: student6._id, courseOfferingId: offeringAi._id, status: 'enrolled' },
      { institutionId: instId, studentId: student7._id, courseOfferingId: offeringAi._id, status: 'enrolled' },
      { institutionId: instId, studentId: student8._id, courseOfferingId: offeringAi._id, status: 'enrolled' },
    ]);
    logger.info('Created Course Offerings and enrolled students.');

    // 11. Attendance Sessions & Records
    const session1 = await AttendanceSession.create({
      institutionId: instId,
      courseOfferingId: offeringDbms._id,
      facultyId: faculty1._id,
      sessionDate: new Date('2025-08-05'),
      startTime: '09:00',
      endTime: '10:00',
      topic: 'Introduction to Relational Algebra and SQL Syntax',
      sessionStatus: 'finalized',
    });

    await AttendanceRecord.create([
      { institutionId: instId, attendanceSessionId: session1._id, studentId: student1._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session1._id, studentId: student2._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session1._id, studentId: student3._id, status: 'absent', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session1._id, studentId: student4._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session1._id, studentId: student5._id, status: 'present', recordedBy: facultyUser._id },
    ]);

    const session2 = await AttendanceSession.create({
      institutionId: instId,
      courseOfferingId: offeringDbms._id,
      facultyId: faculty1._id,
      sessionDate: new Date('2025-08-07'),
      startTime: '09:00',
      endTime: '10:00',
      topic: 'Entity-Relationship Diagrams & Third Normal Form (3NF)',
      sessionStatus: 'finalized',
    });

    await AttendanceRecord.create([
      { institutionId: instId, attendanceSessionId: session2._id, studentId: student1._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session2._id, studentId: student2._id, status: 'late', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session2._id, studentId: student3._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session2._id, studentId: student4._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: session2._id, studentId: student5._id, status: 'excused', recordedBy: facultyUser._id },
    ]);

    const sessionAi1 = await AttendanceSession.create({
      institutionId: instId,
      courseOfferingId: offeringAi._id,
      facultyId: faculty3._id,
      sessionDate: new Date('2025-08-06'),
      startTime: '11:00',
      endTime: '12:00',
      topic: 'Convolutional Neural Networks & Feature Extraction',
      sessionStatus: 'finalized',
    });

    await AttendanceRecord.create([
      { institutionId: instId, attendanceSessionId: sessionAi1._id, studentId: student6._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: sessionAi1._id, studentId: student7._id, status: 'present', recordedBy: facultyUser._id },
      { institutionId: instId, attendanceSessionId: sessionAi1._id, studentId: student8._id, status: 'present', recordedBy: facultyUser._id },
    ]);
    logger.info('Created 3 Attendance Sessions with student attendance records.');

    // 12. Examinations & Assessment Results
    const examMidterm1 = await Examination.create({
      institutionId: instId,
      courseOfferingId: offeringDbms._id,
      examinationName: 'Midterm Assessment 1 — DBMS & Storage',
      examinationType: 'midterm',
      examDate: new Date('2025-09-15'),
      maximumMarks: 50,
      passMarks: 20,
      weightagePercentage: 25,
      status: 'published',
    });

    await AssessmentResult.create([
      {
        institutionId: instId,
        examinationId: examMidterm1._id,
        studentId: student1._id,
        marksObtained: 48,
        grade: 'A+',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-20'),
        remarks: 'Outstanding conceptual clarity & query execution',
      },
      {
        institutionId: instId,
        examinationId: examMidterm1._id,
        studentId: student2._id,
        marksObtained: 44,
        grade: 'A',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-20'),
        remarks: 'Strong architectural design and schema layout',
      },
      {
        institutionId: instId,
        examinationId: examMidterm1._id,
        studentId: student3._id,
        marksObtained: 36,
        grade: 'B',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-20'),
        remarks: 'Good grasp of fundamentals, minor normalization errors',
      },
      {
        institutionId: instId,
        examinationId: examMidterm1._id,
        studentId: student4._id,
        marksObtained: 47,
        grade: 'A+',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-20'),
        remarks: 'Exemplary query plan optimization',
      },
      {
        institutionId: instId,
        examinationId: examMidterm1._id,
        studentId: student5._id,
        marksObtained: 41,
        grade: 'B+',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-20'),
      },
    ]);

    const examAiMidterm = await Examination.create({
      institutionId: instId,
      courseOfferingId: offeringAi._id,
      examinationName: 'Midterm Assessment 1 — Deep Learning Foundations',
      examinationType: 'midterm',
      examDate: new Date('2025-09-17'),
      maximumMarks: 50,
      passMarks: 20,
      weightagePercentage: 25,
      status: 'published',
    });

    await AssessmentResult.create([
      {
        institutionId: instId,
        examinationId: examAiMidterm._id,
        studentId: student6._id,
        marksObtained: 49,
        grade: 'A+',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-22'),
        remarks: 'Flawless mathematical formulation',
      },
      {
        institutionId: instId,
        examinationId: examAiMidterm._id,
        studentId: student7._id,
        marksObtained: 45,
        grade: 'A',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-22'),
      },
      {
        institutionId: instId,
        examinationId: examAiMidterm._id,
        studentId: student8._id,
        marksObtained: 38,
        grade: 'B+',
        resultStatus: 'published',
        enteredBy: facultyUser._id,
        verifiedBy: examUser._id,
        verifiedAt: new Date('2025-09-22'),
      },
    ]);
    logger.info('Created Examinations and published assessment results.');

    // 13. Fee Structures, Invoices & Payments
    const feeStructureCse = await FeeStructure.create({
      institutionId: instId,
      programmeId: progBtechCse._id,
      academicYearId: ay2025._id,
      feeComponents: [
        { name: 'Tuition Fee (Core Academic)', amount: 65000, isOptional: false },
        { name: 'AI & Cloud Supercomputing Lab', amount: 10000, isOptional: false },
        { name: 'Library & IEEE Digital Subscriptions', amount: 5000, isOptional: false },
        { name: 'Student Development & Campus Activity', amount: 5000, isOptional: false },
      ],
      totalAmount: 85000,
      currency: 'INR',
      effectiveFrom: new Date('2025-06-01'),
      effectiveTo: new Date('2026-05-31'),
      status: 'active',
    });

    const invoice1 = await StudentInvoice.create({
      institutionId: instId,
      invoiceNumber: 'INV-2025-001',
      studentId: student1._id,
      academicYearId: ay2025._id,
      feeComponents: feeStructureCse.feeComponents.map((c) => ({ name: c.name, amount: c.amount })),
      totalAmount: 85000,
      paidAmount: 85000,
      balanceAmount: 0,
      dueDate: new Date('2025-08-15'),
      status: 'paid',
    });

    await Payment.create({
      institutionId: instId,
      receiptNumber: 'REC-2025-0001',
      invoiceId: invoice1._id,
      studentId: student1._id,
      amount: 85000,
      currency: 'INR',
      paymentMethod: 'bank_transfer',
      paymentReference: 'NEFT-HDFC-98237462',
      paymentStatus: 'completed',
      receivedBy: accountsUser._id,
      receivedAt: new Date('2025-08-10'),
      notes: 'Full annual academic fee cleared for 2025-2026',
    });

    const invoice2 = await StudentInvoice.create({
      institutionId: instId,
      invoiceNumber: 'INV-2025-002',
      studentId: student2._id,
      academicYearId: ay2025._id,
      feeComponents: feeStructureCse.feeComponents.map((c) => ({ name: c.name, amount: c.amount })),
      totalAmount: 85000,
      paidAmount: 50000,
      balanceAmount: 35000,
      dueDate: new Date('2025-08-15'),
      status: 'partially_paid',
    });

    await Payment.create({
      institutionId: instId,
      receiptNumber: 'REC-2025-0002',
      invoiceId: invoice2._id,
      studentId: student2._id,
      amount: 50000,
      currency: 'INR',
      paymentMethod: 'online',
      paymentReference: 'UPI-RAZORPAY-837261',
      paymentStatus: 'completed',
      receivedBy: accountsUser._id,
      receivedAt: new Date('2025-08-12'),
      notes: 'Installment 1 received via Razorpay UPI',
    });

    const invoice3 = await StudentInvoice.create({
      institutionId: instId,
      invoiceNumber: 'INV-2025-003',
      studentId: student3._id,
      academicYearId: ay2025._id,
      feeComponents: feeStructureCse.feeComponents.map((c) => ({ name: c.name, amount: c.amount })),
      totalAmount: 85000,
      paidAmount: 0,
      balanceAmount: 85000,
      dueDate: new Date('2025-08-15'),
      status: 'unpaid',
    });

    const invoice4 = await StudentInvoice.create({
      institutionId: instId,
      invoiceNumber: 'INV-2025-004',
      studentId: student6._id,
      academicYearId: ay2025._id,
      feeComponents: feeStructureCse.feeComponents.map((c) => ({ name: c.name, amount: c.amount })),
      totalAmount: 85000,
      paidAmount: 85000,
      balanceAmount: 0,
      dueDate: new Date('2025-08-15'),
      status: 'paid',
    });

    await Payment.create({
      institutionId: instId,
      receiptNumber: 'REC-2025-0003',
      invoiceId: invoice4._id,
      studentId: student6._id,
      amount: 85000,
      currency: 'INR',
      paymentMethod: 'online',
      paymentReference: 'STRIPE-CARD-726194',
      paymentStatus: 'completed',
      receivedBy: accountsUser._id,
      receivedAt: new Date('2025-08-14'),
      notes: 'Tuition and AI lab fee paid in full',
    });
    logger.info('Created Fee Structures, Invoices, and Verified Payments.');

    // 14. Announcements (Broad Campus Circulars)
    await Announcement.create([
      {
        institutionId: instId,
        title: '🏛️ Welcome to Imperial College of Engineering & Technology (ICET)',
        body: 'Welcome to the 2025-2026 Academic Year! The ICET governance portal offers centralized timetable access, real-time attendance tracking, exam hall tickets, and online fee clearing.',
        audience: ['all'],
        publishedBy: adminUser._id,
        publishedAt: new Date('2025-07-01'),
        status: 'published',
      },
      {
        institutionId: instId,
        title: '🤖 Annual AI & Robotics Hackathon — Registration Open',
        body: 'The Department of AI & Data Science in partnership with IEEE is organizing the 48-Hour Hackathon with ₹2,00,000 cash prizes. Register on the portal by October 25th.',
        audience: ['students', 'faculty'],
        departmentIds: [deptCse._id, deptAids._id],
        publishedBy: adminUser._id,
        publishedAt: new Date('2025-09-10'),
        status: 'published',
      },
      {
        institutionId: instId,
        title: '📋 Midterm Assessment 1 Official Results Published',
        body: 'Controller of Examinations has officially audited and published the results for Odd Semester Midterm Assessments. Students can view detailed subject-wise marks in their portal.',
        audience: ['students', 'faculty'],
        publishedBy: examUser._id,
        publishedAt: new Date('2025-09-25'),
        status: 'published',
      },
      {
        institutionId: instId,
        title: '💳 Fee Payment Clearance & Examination Hall Ticket Eligibility',
        body: 'Accounts Office circular: All students must ensure outstanding semester dues are cleared to generate digital Hall Tickets for End-Semester examinations.',
        audience: ['students', 'faculty'],
        publishedBy: accountsUser._id,
        publishedAt: new Date('2025-10-01'),
        status: 'published',
      },
    ]);
    logger.info('Created Announcements.');

    // 15. Audit Log Records
    await AuditLog.create([
      {
        institutionId: instId,
        actorUserId: adminUser._id,
        actorRole: 'admin',
        action: 'SYSTEM_INITIALIZED_AND_SEEDED',
        resourceType: 'system',
        timestamp: new Date(),
        metadata: { institutionCode: 'ICET', departmentsCount: 6, version: '2.0.0-PROD' },
      },
      {
        institutionId: instId,
        actorUserId: examUser._id,
        actorRole: 'exam_officer',
        action: 'EXAM_RESULTS_PUBLISHED',
        resourceType: 'examination',
        resourceId: examMidterm1._id.toString(),
        timestamp: new Date('2025-09-25'),
        metadata: { courseCode: 'CS501', verifiedStudents: 5 },
      },
    ]);

    logger.info('✅ Database seed completed successfully!');
    return {
      institution,
      users: { adminUser, hodUser, facultyUser, studentUser1, studentUser2, accountsUser, examUser },
      departments: { deptCse, deptEce, deptMech },
      students: { student1, student2, student3 },
      classes: { classCse3A },
      courses: { courseDbms, courseOs, courseWeb },
    };
  } catch (error) {
    logger.error('Error during database seed:', error);
    throw error;
  }
}

// Direct invocation handler
if (require.main === module) {
  runSeed(true)
    .then(async () => {
      logger.info('Seed process exiting cleanly.');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Seed process terminated with failure:', err);
      await disconnectDB();
      process.exit(1);
    });
}
