import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'online';
export type PaymentStatus = 'completed' | 'failed' | 'refunded' | 'reversed';

export interface IPayment extends Document {
  institutionId: mongoose.Types.ObjectId;
  receiptNumber: string;
  invoiceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentStatus: PaymentStatus;
  receivedBy: mongoose.Types.ObjectId;
  receivedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    receiptNumber: { type: String, required: true, uppercase: true, trim: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'StudentInvoice', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'INR' },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'cheque', 'online'],
      default: 'cash',
    },
    paymentReference: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ['completed', 'failed', 'refunded', 'reversed'],
      default: 'completed',
      index: true,
    },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receivedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

PaymentSchema.index({ institutionId: 1, receiptNumber: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
