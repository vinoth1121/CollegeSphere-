import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

interface AuditLogOptions {
  institutionId: mongoose.Types.ObjectId;
  actorUserId?: mongoose.Types.ObjectId;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  requestId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

export class AuditService {
  static async log(opts: AuditLogOptions): Promise<void> {
    try {
      // Sanitize metadata to never log sensitive fields
      const cleanMeta = opts.metadata ? { ...opts.metadata } : {};
      delete cleanMeta.password;
      delete cleanMeta.passwordHash;
      delete cleanMeta.token;
      delete cleanMeta.cardNumber;
      delete cleanMeta.cvv;

      await AuditLog.create({
        institutionId: opts.institutionId,
        actorUserId: opts.actorUserId,
        actorRole: opts.actorRole,
        action: opts.action,
        resourceType: opts.resourceType,
        resourceId: opts.resourceId,
        timestamp: new Date(),
        requestId: opts.requestId,
        ipAddress: opts.ipAddress,
        metadata: cleanMeta,
        outcome: opts.outcome || 'SUCCESS',
      });
    } catch (err: any) {
      logger.error('Failed to write audit log entry:', err);
    }
  }
}
