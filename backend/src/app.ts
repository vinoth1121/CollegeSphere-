import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/response';
import { connectDB } from './config/db';
import { AppError } from './utils/errors';

// Route Imports
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import facultyRoutes from './routes/faculty.routes';
import academicRoutes from './routes/academic.routes';
import attendanceRoutes from './routes/attendance.routes';
import examinationRoutes from './routes/examination.routes';
import feeRoutes from './routes/fee.routes';
import dashboardRoutes from './routes/dashboard.routes';
import systemRoutes from './routes/system.routes';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          config.nodeEnv === 'development' ||
          origin === config.frontendUrl ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request Parsing & Limits
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined'));
  }

  // Health Check Endpoint (accessible regardless of DB state)
  app.get('/api/v1/health', (req: Request, res: Response) => {
    sendSuccess(
      res,
      {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
        environment: config.nodeEnv,
        version: '1.0.0',
      },
      'CollegeSphere API is operational'
    );
  });

  // Ensure DB connection is established for business endpoints
  app.use(async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
      next();
    } catch (err: any) {
      next(new AppError(`Database connection unavailable: ${err.message || 'Unable to reach database'}`, 503));
    }
  });

  // Mount API Endpoints under /api/v1
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/faculty', facultyRoutes);
  app.use('/api/v1/academic', academicRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/examinations', examinationRoutes);
  app.use('/api/v1/fees', feeRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1', systemRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

export default createApp;
