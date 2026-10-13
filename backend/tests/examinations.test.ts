import request from 'supertest';
import { setupTestDB, teardownTestDB, getTestApp } from './setup';
import { runSeed } from '../database/seed';
import { CourseOffering, Student, Examination } from '../src/models';

describe('Examinations & Results Workflow Tests', () => {
  let app: any;
  let examToken: string;
  let studentToken: string;
  let offeringId: string;
  let studentId: string;

  beforeAll(async () => {
    await setupTestDB();
    await runSeed(false);
    app = getTestApp();

    const examRes = await request(app).post('/api/v1/auth/login').send({
      email: 'exam@collegesphere.edu',
      password: 'Password@123',
    });
    examToken = examRes.body.data.token;

    const studentRes = await request(app).post('/api/v1/auth/login').send({
      email: 'student.arun@collegesphere.edu',
      password: 'Password@123',
    });
    studentToken = studentRes.body.data.token;

    const offering = await CourseOffering.findOne();
    offeringId = offering!._id.toString();

    const student = await Student.findOne({ studentNumber: '2023CSE001' });
    studentId = student!._id.toString();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('POST /api/v1/examinations - should schedule a valid examination', async () => {
    const res = await request(app)
      .post('/api/v1/examinations')
      .set('Authorization', `Bearer ${examToken}`)
      .send({
        courseOfferingId: offeringId,
        examinationName: 'Midterm Assessment 2',
        examinationType: 'midterm',
        examDate: '2025-10-20',
        maximumMarks: 50,
        passMarks: 20,
        weightagePercentage: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.maximumMarks).toBe(50);
  });

  it('POST /api/v1/examinations - should reject passMarks greater than maximumMarks', async () => {
    const res = await request(app)
      .post('/api/v1/examinations')
      .set('Authorization', `Bearer ${examToken}`)
      .send({
        courseOfferingId: offeringId,
        examinationName: 'Invalid Exam',
        examinationType: 'internal',
        examDate: '2025-10-20',
        maximumMarks: 50,
        passMarks: 60, // Greater than 50
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/examinations/:id/results - should reject marks exceeding maximumMarks', async () => {
    const exam = await Examination.findOne({ examinationName: 'Midterm Assessment 2' });
    expect(exam).not.toBeNull();

    const res = await request(app)
      .post(`/api/v1/examinations/${exam!._id}/results`)
      .set('Authorization', `Bearer ${examToken}`)
      .send({
        marksList: [{ studentId, marksObtained: 55 }], // Max is 50
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('maximum marks');
  });

  it('POST /api/v1/examinations/:id/results - should accept valid marks and calculate grade', async () => {
    const exam = await Examination.findOne({ examinationName: 'Midterm Assessment 2' });

    const res = await request(app)
      .post(`/api/v1/examinations/${exam!._id}/results`)
      .set('Authorization', `Bearer ${examToken}`)
      .send({
        marksList: [{ studentId, marksObtained: 45, remarks: 'Excellent' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/examinations/:id/verify and /publish workflow', async () => {
    const exam = await Examination.findOne({ examinationName: 'Midterm Assessment 2' });

    const verifyRes = await request(app)
      .post(`/api/v1/examinations/${exam!._id}/verify`)
      .set('Authorization', `Bearer ${examToken}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.status).toBe('verified');

    const publishRes = await request(app)
      .post(`/api/v1/examinations/${exam!._id}/publish`)
      .set('Authorization', `Bearer ${examToken}`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe('published');
  });

  it('GET /api/v1/examinations/students/:studentId - should return published grades to student', async () => {
    const res = await request(app)
      .get(`/api/v1/examinations/students/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('grade');
  });
});
