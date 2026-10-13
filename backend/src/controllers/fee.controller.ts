import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FeeService } from '../services/fee.service';
import { sendSuccess } from '../utils/response';
import { ForbiddenError } from '../utils/errors';
import { Student } from '../models';

export class FeeController {
  // Structures
  static async getStructures(req: AuthRequest, res: Response) {
    const list = await FeeService.getFeeStructures(req.institutionId!);
    sendSuccess(res, list);
  }

  static async createStructure(req: AuthRequest, res: Response) {
    const struct = await FeeService.createFeeStructure(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, struct, 'Fee structure created', 201);
  }

  // Invoices
  static async getInvoices(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;
    const list = await FeeService.getInvoices(req.institutionId!, filter);
    sendSuccess(res, list);
  }

  static async getInvoiceById(req: AuthRequest, res: Response) {
    const invoice = await FeeService.getInvoiceById(req.institutionId!, req.params.id);

    // If student, ensure invoice belongs to self
    if (req.user?.roles.includes('student') && !req.user?.roles.some(r => ['admin', 'super_admin', 'accounts'].includes(r))) {
      const selfStudent = await Student.findOne({ userId: req.user._id });
      if (!selfStudent || invoice.studentId._id.toString() !== selfStudent._id.toString()) {
        throw new ForbiddenError('You can only view your own invoices');
      }
    }

    sendSuccess(res, invoice);
  }

  static async generateInvoice(req: AuthRequest, res: Response) {
    const invoice = await FeeService.generateInvoice(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, invoice, 'Invoice generated', 201);
  }

  // Payments
  static async recordPayment(req: AuthRequest, res: Response) {
    const payment = await FeeService.recordPayment(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, payment, 'Payment recorded and receipt generated', 201);
  }

  // Student specific
  static async getStudentInvoices(req: AuthRequest, res: Response) {
    const studentId = req.params.studentId;

    if (req.user?.roles.includes('student') && !req.user?.roles.some(r => ['admin', 'super_admin', 'accounts'].includes(r))) {
      const selfStudent = await Student.findOne({ userId: req.user._id });
      if (!selfStudent || selfStudent._id.toString() !== studentId) {
        throw new ForbiddenError('You can only view your own fee records');
      }
    }

    const invoices = await FeeService.getStudentInvoices(req.institutionId!, studentId);
    sendSuccess(res, invoices);
  }

  static async getStudentPayments(req: AuthRequest, res: Response) {
    const studentId = req.params.studentId;

    if (req.user?.roles.includes('student') && !req.user?.roles.some(r => ['admin', 'super_admin', 'accounts'].includes(r))) {
      const selfStudent = await Student.findOne({ userId: req.user._id });
      if (!selfStudent || selfStudent._id.toString() !== studentId) {
        throw new ForbiddenError('You can only view your own payment records');
      }
    }

    const payments = await FeeService.getStudentPayments(req.institutionId!, studentId);
    sendSuccess(res, payments);
  }
}
