import { env } from '@/env';
import mongoose from 'mongoose';

export const connectToMongoDb = async () => {
  const uri = env.DB_URI;
  try {
    await mongoose.connect(uri!, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ MongoDB connection error:', err.message);
    } else {
      console.error('❌ Unknown error connecting to MongoDB');
    }
    process.exit(1); // Exit on failure
  }
};
