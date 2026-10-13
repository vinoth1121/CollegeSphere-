import mongoose from 'mongoose';
import {
  Student,
  Faculty,
  Department,
  CourseOffering,
  Enrollment,
  AttendanceRecord,
  AttendanceSession,
  Examination,
  AssessmentResult,
  StudentInvoice,
  Payment,
  Announcement,
  AuditLog,
} from '../models';

export class DashboardService {
  static async getAdminDashboard(institutionId: mongoose.Types.ObjectId) {
    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalOfferings,
      invoices,
      payments,
      recentAudit,
      announcements,
    ] = await Promise.all([
      Student.countDocuments({ institutionId, studentStatus: 'active' }),
      Faculty.countDocuments({ institutionId, employmentStatus: 'active' }),
      Department.countDocuments({ institutionId, isActive: true }),
      CourseOffering.countDocuments({ institutionId, status: { $in: ['open', 'in_progress'] } }),
      StudentInvoice.find({ institutionId }),
      Payment.find({ institutionId, paymentStatus: 'completed' }),
      AuditLog.find({ institutionId }).sort({ timestamp: -1 }).limit(10).lean(),
      Announcement.find({ institutionId, status: 'published' }).sort({ publishedAt: -1 }).limit(5).lean(),
    ]);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalCollected = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalPending = Math.max(0, totalInvoiced - totalCollected);

    // Calculate institutional attendance rate
    const [totalAttRecords, presentAttRecords] = await Promise.all([
      AttendanceRecord.countDocuments({ institutionId }),
      AttendanceRecord.countDocuments({ institutionId, status: { $in: ['present', 'late'] } }),
    ]);
    const overallAttendanceRate = totalAttRecords > 0 ? Math.round((presentAttRecords / totalAttRecords) * 100) : 100;

    return {
      metrics: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalActiveCourseOfferings: totalOfferings,
        totalInvoiced,
        totalCollected,
        totalPending,
        overallAttendanceRate,
      },
      recentAudit,
      announcements,
    };
  }

  static async getFacultyDashboard(institutionId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    const faculty = await Faculty.findOne({ institutionId, userId });
    if (!faculty) {
      return { assignedOfferings: [], todaySessions: [], pendingAssessments: [], metrics: {} };
    }

    const offerings = await CourseOffering.find({ institutionId, facultyIds: faculty._id })
      .populate('courseId', 'courseCode courseName credits')
      .populate('classId', 'className section')
      .lean();

    const offeringIds = offerings.map((o) => o._id);

    const [todaySessions, pendingAssessments] = await Promise.all([
      AttendanceSession.find({
        institutionId,
        facultyId: faculty._id,
      })
        .populate({
          path: 'courseOfferingId',
          populate: { path: 'courseId', select: 'courseCode courseName' },
        })
        .sort({ sessionDate: -1 })
        .limit(5)
        .lean(),
      Examination.find({
        institutionId,
        courseOfferingId: { $in: offeringIds },
        status: { $in: ['scheduled', 'draft_marks'] },
      })
        .populate({
          path: 'courseOfferingId',
          populate: { path: 'courseId', select: 'courseCode courseName' },
        })
        .lean(),
    ]);

    const totalStudentsTaught = offerings.reduce((sum, off) => sum + (off.enrolledCount || 0), 0);

    return {
      facultyProfile: faculty,
      assignedOfferings: offerings,
      todaySessions,
      pendingAssessments,
      metrics: {
        totalAssignedCourses: offerings.length,
        totalStudentsTaught,
      },
    };
  }

  static async getStudentDashboard(institutionId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    const student = await Student.findOne({ institutionId, userId })
      .populate('programmeId', 'programmeName programmeCode')
      .populate('departmentId', 'departmentName departmentCode')
      .populate('classId', 'className section')
      .populate('currentSemesterId', 'semesterNumber')
      .lean();

    if (!student) {
      return { profile: null, enrollments: [], attendance: {}, results: [], invoices: [] };
    }

    const [enrollments, attendanceRecords, results, invoices, announcements] = await Promise.all([
      Enrollment.find({ institutionId, studentId: student._id, status: 'enrolled' })
        .populate({
          path: 'courseOfferingId',
          populate: [
            { path: 'courseId', select: 'courseCode courseName credits' },
            { path: 'facultyIds', select: 'firstName lastName' },
          ],
        })
        .lean(),
      AttendanceRecord.find({ institutionId, studentId: student._id }).lean(),
      AssessmentResult.find({ institutionId, studentId: student._id, resultStatus: 'published' })
        .populate({
          path: 'examinationId',
          select: 'examinationName examDate maximumMarks passMarks',
          populate: {
            path: 'courseOfferingId',
            populate: { path: 'courseId', select: 'courseCode courseName' },
          },
        })
        .lean(),
      StudentInvoice.find({ institutionId, studentId: student._id }).sort({ dueDate: 1 }).lean(),
      Announcement.find({ institutionId, status: 'published' }).sort({ publishedAt: -1 }).limit(5).lean(),
    ]);

    const totalAtt = attendanceRecords.length;
    const presentAtt = attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    const totalFeeDue = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

    return {
      profile: student,
      enrollments,
      attendance: {
        totalSessions: totalAtt,
        presentSessions: presentAtt,
        percentage: attendancePercentage,
      },
      results,
      invoices,
      announcements,
      metrics: {
        enrolledCoursesCount: enrollments.length,
        attendancePercentage,
        totalFeeDue,
        publishedExamsCount: results.length,
      },
    };
  }

  static async getAccountsDashboard(institutionId: mongoose.Types.ObjectId) {
    const [invoices, payments] = await Promise.all([
      StudentInvoice.find({ institutionId }).lean(),
      Payment.find({ institutionId, paymentStatus: 'completed' })
        .populate('studentId', 'studentNumber firstName lastName')
        .sort({ receivedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

    const unpaidCount = invoices.filter((i) => i.status === 'unpaid').length;
    const partialCount = invoices.filter((i) => i.status === 'partially_paid').length;
    const paidCount = invoices.filter((i) => i.status === 'paid').length;

    return {
      metrics: {
        totalInvoiced,
        totalCollected,
        totalOutstanding,
        unpaidInvoices: unpaidCount,
        partiallyPaidInvoices: partialCount,
        fullyPaidInvoices: paidCount,
      },
      recentPayments: payments,
    };
  }
}
