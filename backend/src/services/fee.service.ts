import mongoose from 'mongoose';
import { FeeStructure, StudentInvoice, Payment, Student } from '../models';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export class FeeService {
  // --- Fee Structures ---
  static async getFeeStructures(institutionId: mongoose.Types.ObjectId) {
    return FeeStructure.find({ institutionId })
      .populate('programmeId', 'programmeName programmeCode')
      .populate('academicYearId', 'label');
  }

  static async createFeeStructure(institutionId: mongoose.Types.ObjectId, data: any, actorId: mongoose.Types.ObjectId) {
    const totalAmount = data.feeComponents.reduce((sum: number, comp: any) => sum + Number(comp.amount || 0), 0);
    const structure = await FeeStructure.create({
      ...data,
      institutionId,
      totalAmount,
    });

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'FEE_STRUCTURE_CREATED',
      resourceType: 'feeStructures',
      resourceId: structure._id,
      metadata: { totalAmount },
    });

    return structure;
  }

  // --- Invoices ---
  static async getInvoices(institutionId: mongoose.Types.ObjectId, filter: any = {}) {
    return StudentInvoice.find({ institutionId, ...filter })
      .populate('studentId', 'studentNumber firstName lastName')
      .populate('academicYearId', 'label')
      .sort({ createdAt: -1 });
  }

  static async getInvoiceById(institutionId: mongoose.Types.ObjectId, id: string) {
    const invoice = await StudentInvoice.findOne({ _id: id, institutionId })
      .populate('studentId', 'studentNumber firstName lastName contact')
      .populate('academicYearId', 'label')
      .lean();

    if (!invoice) throw new NotFoundError('Invoice not found');

    const payments = await Payment.find({ institutionId, invoiceId: id }).lean();
    return { ...invoice, payments };
  }

  static async generateInvoice(institutionId: mongoose.Types.ObjectId, data: any, actorId: mongoose.Types.ObjectId) {
    const totalAmount = data.feeComponents.reduce((sum: number, comp: any) => sum + Number(comp.amount || 0), 0);

    const count = await StudentInvoice.countDocuments({ institutionId });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const invoice = await StudentInvoice.create({
      ...data,
      institutionId,
      invoiceNumber,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: 'unpaid',
    });

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'INVOICE_GENERATED',
      resourceType: 'studentInvoices',
      resourceId: invoice._id,
      metadata: { invoiceNumber, totalAmount },
    });

    return invoice;
  }

  // --- Payments ---
  static async recordPayment(institutionId: mongoose.Types.ObjectId, data: any, actorId: mongoose.Types.ObjectId) {
    const invoice = await StudentInvoice.findOne({ _id: data.invoiceId, institutionId });
    if (!invoice) throw new NotFoundError('Invoice not found');

    if (data.paymentReference) {
      const existingRef = await Payment.findOne({
        institutionId,
        paymentReference: data.paymentReference,
        paymentStatus: 'completed',
      });
      if (existingRef) {
        throw new ConflictError(`Payment reference ${data.paymentReference} has already been recorded`);
      }
    }

    const payAmount = Number(data.amount);
    if (payAmount <= 0) {
      throw new BadRequestError('Payment amount must be greater than zero');
    }

    if (payAmount > invoice.balanceAmount) {
      throw new BadRequestError(`Payment amount (₹${payAmount}) cannot exceed outstanding balance (₹${invoice.balanceAmount})`);
    }

    const count = await Payment.countDocuments({ institutionId });
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const payment = await Payment.create({
      ...data,
      institutionId,
      studentId: invoice.studentId,
      receiptNumber,
      amount: payAmount,
      paymentStatus: 'completed',
      receivedBy: actorId,
      receivedAt: new Date(),
    });

    // Update invoice balances safely
    invoice.paidAmount += payAmount;
    invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    invoice.status = invoice.balanceAmount === 0 ? 'paid' : 'partially_paid';
    await invoice.save();

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'PAYMENT_RECORDED',
      resourceType: 'payments',
      resourceId: payment._id,
      metadata: { receiptNumber, amount: payAmount, invoiceId: invoice._id },
    });

    return payment;
  }

  static async getStudentInvoices(institutionId: mongoose.Types.ObjectId, studentId: string) {
    return StudentInvoice.find({ institutionId, studentId })
      .populate('academicYearId', 'label')
      .sort({ createdAt: -1 });
  }

  static async getStudentPayments(institutionId: mongoose.Types.ObjectId, studentId: string) {
    return Payment.find({ institutionId, studentId })
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .sort({ receivedAt: -1 });
  }
}
