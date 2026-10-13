import request from 'supertest';
import { setupTestDB, teardownTestDB, getTestApp } from './setup';
import { runSeed } from '../database/seed';
import { CourseOffering, Faculty, Student, AttendanceRecord } from '../src/models';

describe('Attendance Management Tests', () => {
  let app: any;
  let facultyToken: string;
  let offeringId: string;
  let facultyId: string;
  let student1Id: string;
  let student2Id: string;

  beforeAll(async () => {
    await setupTestDB();
    await runSeed(false);
    app = getTestApp();

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'hod.cse@collegesphere.edu',
      password: 'Password@123',
    });
    facultyToken = loginRes.body.data.token;

    const offering = await CourseOffering.findOne();
    offeringId = offering!._id.toString();
    const fac = await Faculty.findOne();
    facultyId = fac!._id.toString();

    const s1 = await Student.findOne({ studentNumber: '2023CSE001' });
    student1Id = s1!._id.toString();
    const s2 = await Student.findOne({ studentNumber: '2023CSE002' });
    student2Id = s2!._id.toString();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('POST /api/v1/attendance/sessions - should create a valid attendance session', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/sessions')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        courseOfferingId: offeringId,
        facultyId: facultyId,
        sessionDate: '2025-08-10',
        startTime: '10:00',
        endTime: '11:00',
        topic: 'Indexing & B-Trees in DBMS',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.topic).toBe('Indexing & B-Trees in DBMS');
  });

  it('POST /api/v1/attendance/sessions/:id/records - should submit bulk attendance', async () => {
    const sessionRes = await request(app)
      .post('/api/v1/attendance/sessions')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        courseOfferingId: offeringId,
        facultyId: facultyId,
        sessionDate: '2025-08-12',
        startTime: '11:00',
        endTime: '12:00',
        topic: 'Concurrency Control & ACID',
      });
    const sessionId = sessionRes.body.data._id;

    const res = await request(app)
      .post(`/api/v1/attendance/sessions/${sessionId}/records`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        records: [
          { studentId: student1Id, status: 'present' },
          { studentId: student2Id, status: 'absent' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/attendance/records/:id/correct - should log correction history', async () => {
    const record = await AttendanceRecord.findOne({ studentId: student2Id, status: 'absent' });
    expect(record).not.toBeNull();

    const res = await request(app)
      .post(`/api/v1/attendance/records/${record!._id}/correct`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        status: 'excused',
        reason: 'Medical certificate approved by academic dean',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('excused');
    expect(res.body.data.correctionHistory.length).toBeGreaterThan(0);
    expect(res.body.data.correctionHistory[0].reason).toContain('Medical certificate');
  });
});
