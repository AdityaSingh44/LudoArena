import mongoose from 'mongoose';
import { storage } from './storage.js';

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('ℹ️ No MONGO_URI provided in environment, using robust memory storage store.');
    storage.setMongoConnected(false);
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully to database');
    storage.setMongoConnected(true);
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed, falling back to memory storage store:', (error as Error).message);
    storage.setMongoConnected(false);
  }
}
