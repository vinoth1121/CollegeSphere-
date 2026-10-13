import { createApp } from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    await connectDB();
    logger.info(`Connected to MongoDB successfully (${config.dbName})`);

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`CollegeSphere API running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err: any) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
