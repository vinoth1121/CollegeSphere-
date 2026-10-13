import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  code: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contactDetails: {
    email: string;
    phone?: string;
    website?: string;
  };
  timezone: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },
    contactDetails: {
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: String,
      website: String,
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Institution = mongoose.model<IInstitution>('Institution', InstitutionSchema);
