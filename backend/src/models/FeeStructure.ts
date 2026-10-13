import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeComponent {
  name: string;
  amount: number;
  isOptional: boolean;
}

export interface IFeeStructure extends Document {
  institutionId: mongoose.Types.ObjectId;
  programmeId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  feeComponents: IFeeComponent[];
  totalAmount: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo: Date;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema = new Schema<IFeeStructure>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true, index: true },
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
        isOptional: { type: Boolean, default: false },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, required: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  },
  { timestamps: true }
);

FeeStructureSchema.index(
  { institutionId: 1, programmeId: 1, academicYearId: 1 },
  { unique: true }
);

export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);
