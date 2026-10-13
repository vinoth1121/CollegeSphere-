import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../backend/src/config/db';
import * as models from '../../backend/src/models';
import { logger } from '../../backend/src/utils/logger';

export async function ensureIndexes(): Promise<void> {
  try {
    await connectDB();
    logger.info('Ensuring all model indexes are synchronized in MongoDB...');

    for (const [name, model] of Object.entries(models)) {
      if ((model as any).init && typeof (model as any).init === 'function') {
        await (model as any).init();
        logger.info(`Indexes initialized for: ${name}`);
      }
    }

    logger.info('✅ All collection indexes successfully created and verified.');
  } catch (error) {
    logger.error('Failed to ensure indexes:', error);
    throw error;
  }
}

if (require.main === module) {
  ensureIndexes()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Index sync failed:', err);
      await disconnectDB();
      process.exit(1);
    });
}
