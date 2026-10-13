import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  institutionId: mongoose.Types.ObjectId;
  actorUserId?: mongoose.Types.ObjectId;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  timestamp: Date;
  requestId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: { type: String },
    action: { type: String, required: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    requestId: { type: String },
    ipAddress: { type: String },
    metadata: { type: Schema.Types.Mixed },
    outcome: { type: String, enum: ['SUCCESS', 'FAILURE', 'DENIED'], default: 'SUCCESS' },
  },
  { timestamps: false }
);

AuditLogSchema.index({ institutionId: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
