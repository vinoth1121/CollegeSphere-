import { Router } from 'express';
import { FeeController } from '../controllers/fee.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

// Structures
router.get('/structures', asyncHandler(FeeController.getStructures));
router.post('/structures', requireRole('accounts', 'admin', 'super_admin'), asyncHandler(FeeController.createStructure));

// Invoices
router.get('/invoices', requireRole('accounts', 'admin', 'super_admin'), asyncHandler(FeeController.getInvoices));
router.post('/invoices', requireRole('accounts', 'admin', 'super_admin'), asyncHandler(FeeController.generateInvoice));
router.get('/invoices/:id', asyncHandler(FeeController.getInvoiceById));

// Payments
router.post('/payments', requireRole('accounts', 'admin', 'super_admin'), asyncHandler(FeeController.recordPayment));

// Student specifics
router.get('/students/:studentId/invoices', asyncHandler(FeeController.getStudentInvoices));
router.get('/students/:studentId/payments', asyncHandler(FeeController.getStudentPayments));

export default router;
