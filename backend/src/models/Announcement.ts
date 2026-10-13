import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  institutionId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  audience: ('all' | 'students' | 'faculty' | 'hod')[];
  departmentIds: mongoose.Types.ObjectId[];
  publishedBy: mongoose.Types.ObjectId;
  publishedAt: Date;
  expiresAt?: Date;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    audience: {
      type: [String],
      enum: ['all', 'students', 'faculty', 'hod'],
      default: ['all'],
    },
    departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ institutionId: 1, status: 1, publishedAt: -1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
