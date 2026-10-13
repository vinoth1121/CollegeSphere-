import request from 'supertest';
import { setupTestDB, teardownTestDB, getTestApp } from './setup';
import { runSeed } from '../database/seed';
import { Student, StudentInvoice, AcademicYear } from '../src/models';

describe('Fees & Payment Accounting Tests', () => {
  let app: any;
  let accountsToken: string;
  let student1Id: string;
  let ayId: string;

  beforeAll(async () => {
    await setupTestDB();
    await runSeed(false);
    app = getTestApp();

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'accounts@collegesphere.edu',
      password: 'Password@123',
    });
    accountsToken = loginRes.body.data.token;

    const s1 = await Student.findOne({ studentNumber: '2023CSE001' });
    student1Id = s1!._id.toString();

    const ay = await AcademicYear.findOne({ label: '2025-2026' });
    ayId = ay!._id.toString();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('POST /api/v1/fees/invoices - should generate a student invoice with calculated total', async () => {
    const res = await request(app)
      .post('/api/v1/fees/invoices')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        studentId: student1Id,
        academicYearId: ayId,
        feeComponents: [
          { name: 'Semester Exam Fee', amount: 2500 },
          { name: 'Lab Maintenance', amount: 1500 },
        ],
        dueDate: '2025-11-30',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAmount).toBe(4000);
    expect(res.body.data.balanceAmount).toBe(4000);
    expect(res.body.data.status).toBe('unpaid');
  });

  it('POST /api/v1/fees/payments - should record partial payment and update invoice balance', async () => {
    const invoice = await StudentInvoice.findOne({ status: 'unpaid' });
    expect(invoice).not.toBeNull();

    const res = await request(app)
      .post('/api/v1/fees/payments')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        invoiceId: invoice!._id.toString(),
        amount: 2000,
        paymentMethod: 'bank_transfer',
        paymentReference: 'TEST-TXN-001',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.receiptNumber).toMatch(/^REC-/);

    // Verify invoice balance updated
    const updatedInvoice = await StudentInvoice.findById(invoice!._id);
    expect(updatedInvoice!.paidAmount).toBe(2000);
    expect(updatedInvoice!.balanceAmount).toBe(2000);
    expect(updatedInvoice!.status).toBe('partially_paid');
  });

  it('POST /api/v1/fees/payments - should reject payment amount exceeding outstanding balance', async () => {
    const invoice = await StudentInvoice.findOne({ status: 'partially_paid' });
    expect(invoice).not.toBeNull();

    const res = await request(app)
      .post('/api/v1/fees/payments')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        invoiceId: invoice!._id.toString(),
        amount: 50000, // Balance is only 2000
        paymentMethod: 'cash',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('cannot exceed outstanding balance');
  });

  it('POST /api/v1/fees/payments - should reject duplicate payment reference', async () => {
    const invoice = await StudentInvoice.findOne({ status: 'partially_paid' });

    const res = await request(app)
      .post('/api/v1/fees/payments')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        invoiceId: invoice!._id.toString(),
        amount: 1000,
        paymentMethod: 'bank_transfer',
        paymentReference: 'TEST-TXN-001', // Already used above
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
