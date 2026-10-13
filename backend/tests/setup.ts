import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';

let mongoServer: MongoMemoryServer | null = null;

export async function setupTestDB() {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  const uri = mongoServer.getUri();
  await connectDB(uri);
  return { mongoServer, uri };
}

export async function teardownTestDB() {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export function getTestApp() {
  return createApp();
}
