import request from 'supertest';
import { setupTestDB, teardownTestDB, clearTestDB, getTestApp } from './setup';
import { runSeed } from '../database/seed';

describe('Authentication & Session API Tests', () => {
  let app: any;

  beforeAll(async () => {
    await setupTestDB();
    await runSeed(false);
    app = getTestApp();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('POST /api/v1/auth/login - should authenticate valid admin credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@collegesphere.edu',
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.roles).toContain('admin');
  });

  it('POST /api/v1/auth/login - should reject invalid password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@collegesphere.edu',
      password: 'WrongPassword999',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login - should reject non-existent user email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nonexistent@collegesphere.edu',
      password: 'Password@123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me - should return user profile with valid Bearer token', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@collegesphere.edu',
      password: 'Password@123',
    });
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('admin@collegesphere.edu');
  });

  it('GET /api/v1/auth/me - should reject request with missing token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
