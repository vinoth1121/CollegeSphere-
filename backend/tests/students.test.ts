import request from 'supertest';
import { setupTestDB, teardownTestDB, getTestApp } from './setup';
import { runSeed } from '../database/seed';
import { Department, Programme, AcademicYear, Semester, Class } from '../src/models';

describe('Student Records Management Tests', () => {
  let app: any;
  let adminToken: string;
  let deptId: string;
  let progId: string;
  let ayId: string;
  let semId: string;
  let classId: string;

  beforeAll(async () => {
    await setupTestDB();
    await runSeed(false);
    app = getTestApp();

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@collegesphere.edu',
      password: 'Password@123',
    });
    adminToken = loginRes.body.data.token;

    const dept = await Department.findOne({ departmentCode: 'CSE' });
    deptId = dept!._id.toString();
    const prog = await Programme.findOne({ programmeCode: 'BTECH-CSE' });
    progId = prog!._id.toString();
    const ay = await AcademicYear.findOne({ label: '2025-2026' });
    ayId = ay!._id.toString();
    const sem = await Semester.findOne({ semesterNumber: 5 });
    semId = sem!._id.toString();
    const cls = await Class.findOne({ className: 'CSE-3A' });
    classId = cls!._id.toString();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('GET /api/v1/students - should return paginated list of students', async () => {
    const res = await request(app)
      .get('/api/v1/students?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('GET /api/v1/students - should filter students by search query', async () => {
    const res = await request(app)
      .get('/api/v1/students?search=Arun')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].firstName).toBe('Arun');
  });

  it('POST /api/v1/students - should admit a valid new student', async () => {
    const newStudent = {
      studentNumber: '2023CSE999',
      firstName: 'Vikram',
      lastName: 'Seth',
      gender: 'male',
      departmentId: deptId,
      programmeId: progId,
      admissionAcademicYearId: ayId,
      currentSemesterId: semId,
      classId: classId,
      contact: {
        email: 'vikram.seth@collegesphere.edu',
        phone: '+91-9988776655',
      },
    };

    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newStudent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentNumber).toBe('2023CSE999');
  });

  it('POST /api/v1/students - should reject duplicate student roll number (409 Conflict)', async () => {
    const duplicate = {
      studentNumber: '2023CSE001', // already exists
      firstName: 'Fake',
      lastName: 'Student',
      departmentId: deptId,
      programmeId: progId,
      admissionAcademicYearId: ayId,
      currentSemesterId: semId,
      contact: { email: 'fake@collegesphere.edu' },
    };

    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(duplicate);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
