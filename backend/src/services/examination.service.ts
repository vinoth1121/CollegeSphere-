import mongoose from 'mongoose';
import { Examination, AssessmentResult, CourseOffering, Student } from '../models';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuditService } from './audit.service';

export function calculateGrade(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
}

export class ExaminationService {
  static async scheduleExamination(institutionId: mongoose.Types.ObjectId, data: any, actorId: mongoose.Types.ObjectId) {
    if (data.passMarks > data.maximumMarks) {
      throw new BadRequestError('Passing marks cannot exceed maximum marks');
    }

    const exam = await Examination.create({
      ...data,
      institutionId,
      examDate: new Date(data.examDate),
      status: 'scheduled',
    });

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'EXAMINATION_SCHEDULED',
      resourceType: 'examinations',
      resourceId: exam._id,
      metadata: { name: exam.examinationName, maxMarks: exam.maximumMarks },
    });

    return exam;
  }

  static async getExaminations(institutionId: mongoose.Types.ObjectId, filter: any = {}) {
    return Examination.find({ institutionId, ...filter })
      .populate({
        path: 'courseOfferingId',
        populate: [
          { path: 'courseId', select: 'courseCode courseName' },
          { path: 'classId', select: 'className section' },
        ],
      })
      .sort({ examDate: -1 });
  }

  static async getExamResults(institutionId: mongoose.Types.ObjectId, examId: string) {
    const exam = await Examination.findOne({ _id: examId, institutionId });
    if (!exam) throw new NotFoundError('Examination not found');

    const results = await AssessmentResult.find({ institutionId, examinationId: examId })
      .populate('studentId', 'studentNumber firstName lastName')
      .populate('enteredBy', 'email')
      .populate('verifiedBy', 'email')
      .lean();

    return { exam, results };
  }

  static async submitMarks(
    institutionId: mongoose.Types.ObjectId,
    examId: string,
    marksList: Array<{ studentId: string; marksObtained: number; remarks?: string }>,
    actorId: mongoose.Types.ObjectId
  ) {
    const exam = await Examination.findOne({ _id: examId, institutionId });
    if (!exam) throw new NotFoundError('Examination not found');

    if (exam.status === 'published') {
      throw new ForbiddenError('Cannot modify marks for an already published examination. Request official re-evaluation.');
    }

    for (const item of marksList) {
      if (item.marksObtained < 0 || item.marksObtained > exam.maximumMarks) {
        throw new BadRequestError(
          `Marks for student ${item.studentId} (${item.marksObtained}) must be between 0 and maximum marks (${exam.maximumMarks})`
        );
      }
    }

    const ops: any[] = marksList.map((item) => ({
      updateOne: {
        filter: { institutionId, examinationId: exam._id, studentId: item.studentId },
        update: {
          $set: {
            marksObtained: item.marksObtained,
            grade: calculateGrade(item.marksObtained, exam.maximumMarks),
            resultStatus: 'draft',
            enteredBy: actorId,
            remarks: item.remarks,
          },
        },
        upsert: true,
      },
    }));

    await AssessmentResult.bulkWrite(ops);
    exam.status = 'draft_marks';
    await exam.save();

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'EXAM_MARKS_SUBMITTED',
      resourceType: 'examinations',
      resourceId: exam._id,
      metadata: { count: marksList.length },
    });

    return { success: true, count: marksList.length };
  }

  static async verifyResults(institutionId: mongoose.Types.ObjectId, examId: string, actorId: mongoose.Types.ObjectId) {
    const exam = await Examination.findOne({ _id: examId, institutionId });
    if (!exam) throw new NotFoundError('Examination not found');

    await AssessmentResult.updateMany(
      { institutionId, examinationId: examId },
      { $set: { resultStatus: 'verified', verifiedBy: actorId, verifiedAt: new Date() } }
    );

    exam.status = 'verified';
    await exam.save();

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'EXAM_MARKS_VERIFIED',
      resourceType: 'examinations',
      resourceId: exam._id,
    });

    return exam;
  }

  static async publishResults(institutionId: mongoose.Types.ObjectId, examId: string, actorId: mongoose.Types.ObjectId) {
    const exam = await Examination.findOne({ _id: examId, institutionId });
    if (!exam) throw new NotFoundError('Examination not found');

    await AssessmentResult.updateMany(
      { institutionId, examinationId: examId },
      { $set: { resultStatus: 'published' } }
    );

    exam.status = 'published';
    await exam.save();

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'EXAM_RESULTS_PUBLISHED',
      resourceType: 'examinations',
      resourceId: exam._id,
    });

    return exam;
  }

  static async getStudentResults(institutionId: mongoose.Types.ObjectId, studentId: string) {
    // Only published results are exposed to students
    const results = await AssessmentResult.find({
      institutionId,
      studentId,
      resultStatus: 'published',
    })
      .populate({
        path: 'examinationId',
        select: 'examinationName examinationType examDate maximumMarks passMarks',
        populate: {
          path: 'courseOfferingId',
          populate: { path: 'courseId', select: 'courseCode courseName credits' },
        },
      })
      .lean();

    return results;
  }
}
