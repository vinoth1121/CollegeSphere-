import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceComponent {
  name: string;
  amount: number;
}

export interface IStudentInvoice extends Document {
  institutionId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  feeComponents: IInvoiceComponent[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: Date;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const StudentInvoiceSchema = new Schema<IStudentInvoice>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    invoiceNumber: { type: String, required: true, uppercase: true, trim: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
      index: true,
    },
    feeComponents: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'],
      default: 'unpaid',
      index: true,
    },
  },
  { timestamps: true }
);

StudentInvoiceSchema.index({ institutionId: 1, invoiceNumber: 1 }, { unique: true });

export const StudentInvoice = mongoose.model<IStudentInvoice>(
  'StudentInvoice',
  StudentInvoiceSchema
);
