import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentRecord extends Document {
  institutionId: mongoose.Types.ObjectId;
  ownerType: 'student' | 'faculty' | 'institution' | 'course';
  ownerId: mongoose.Types.ObjectId;
  documentType: string;
  storageKey: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocumentRecord>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    ownerType: {
      type: String,
      enum: ['student', 'faculty', 'institution', 'course'],
      required: true,
    },
    ownerId: { type: Schema.Types.ObjectId, required: true },
    documentType: { type: String, required: true },
    storageKey: { type: String, required: true },
    originalFilename: { type: String, required: true },
    contentType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DocumentSchema.index({ institutionId: 1, ownerType: 1, ownerId: 1 });

export const DocumentRecord = mongoose.model<IDocumentRecord>('DocumentRecord', DocumentSchema);
