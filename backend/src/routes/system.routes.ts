import { Router, Response } from 'express';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { Announcement, AuditLog, Institution } from '../models';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { AuditService } from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

// Announcements
router.get(
  '/announcements',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const list = await Announcement.find({
      institutionId: req.institutionId!,
      status: 'published',
    })
      .populate('publishedBy', 'email')
      .sort({ publishedAt: -1 });
    sendSuccess(res, list);
  })
);

router.post(
  '/announcements',
  requireRole('admin', 'super_admin', 'hod', 'faculty'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const announcement = await Announcement.create({
      ...req.body,
      institutionId: req.institutionId!,
      publishedBy: req.user!._id,
      publishedAt: new Date(),
      status: 'published',
    });

    await AuditService.log({
      institutionId: req.institutionId!,
      actorUserId: req.user!._id,
      action: 'ANNOUNCEMENT_PUBLISHED',
      resourceType: 'announcements',
      resourceId: announcement._id,
      metadata: { title: announcement.title },
    });

    sendSuccess(res, announcement, 'Announcement published successfully', 201);
  })
);

// Audit Logs (Strict Admin only)
router.get(
  '/audit/logs',
  requireRole('admin', 'super_admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 25));
    const skip = (page - 1) * limit;

    const filter: any = { institutionId: req.institutionId! };
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resourceType) filter.resourceType = req.query.resourceType;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actorUserId', 'email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    sendSuccess(res, logs, 'Audit logs retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  })
);

// Institution
router.get(
  '/institution',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const inst = await Institution.findById(req.institutionId!);
    if (!inst) throw new NotFoundError('Institution not found');
    sendSuccess(res, inst);
  })
);

router.patch(
  '/institution',
  requireRole('admin', 'super_admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const inst = await Institution.findByIdAndUpdate(req.institutionId!, { $set: req.body }, { new: true });
    if (!inst) throw new NotFoundError('Institution not found');

    await AuditService.log({
      institutionId: req.institutionId!,
      actorUserId: req.user!._id,
      action: 'INSTITUTION_SETTINGS_UPDATED',
      resourceType: 'institutions',
      resourceId: inst._id,
    });

    sendSuccess(res, inst, 'Institution configuration updated');
  })
);

export default router;
