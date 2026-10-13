import request from 'supertest';
import { setupTestDB, teardownTestDB, getTestApp } from './setup';
import { runSeed } from '../database/seed';
import { Student } from '../src/models';

describe('Authorization & RBAC Boundary Tests', () => {
  let app: any;
  let student1Token: string;
  let student2Token: string;
  let accountsToken: string;
  let facultyToken: string;
  let student1Id: string;
  let student2Id: string;

  beforeAll(async () => {
    await setupTestDB();
    await runSeed(false);
    app = getTestApp();

    // Login Student 1
    const s1Res = await request(app).post('/api/v1/auth/login').send({
      email: 'student.arun@collegesphere.edu',
      password: 'Password@123',
    });
    student1Token = s1Res.body.data.token;

    // Login Student 2
    const s2Res = await request(app).post('/api/v1/auth/login').send({
      email: 'student.priya@collegesphere.edu',
      password: 'Password@123',
    });
    student2Token = s2Res.body.data.token;

    // Login Accounts
    const accRes = await request(app).post('/api/v1/auth/login').send({
      email: 'accounts@collegesphere.edu',
      password: 'Password@123',
    });
    accountsToken = accRes.body.data.token;

    // Login Faculty
    const facRes = await request(app).post('/api/v1/auth/login').send({
      email: 'faculty.cse@collegesphere.edu',
      password: 'Password@123',
    });
    facultyToken = facRes.body.data.token;

    const s1Doc = await Student.findOne({ studentNumber: '2023CSE001' });
    student1Id = s1Doc!._id.toString();
    const s2Doc = await Student.findOne({ studentNumber: '2023CSE002' });
    student2Id = s2Doc!._id.toString();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('Student can access their own student record', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${student1Id}`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.studentNumber).toBe('2023CSE001');
  });

  it('Student CANNOT access another student record (Strict 403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${student2Id}`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Accounts staff CANNOT submit examination marks (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/examinations/640000000000000000000001/results')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({ marksList: [] });

    expect(res.status).toBe(403);
  });

  it('Faculty staff CANNOT create fee structures (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/fees/structures')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ feeComponents: [], totalAmount: 1000 });

    expect(res.status).toBe(403);
  });

  it('Student CANNOT admit other students (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ studentNumber: 'HACK001', firstName: 'Evil', lastName: 'Actor' });

    expect(res.status).toBe(403);
  });
});
