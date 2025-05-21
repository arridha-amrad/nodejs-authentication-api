import mongoose from 'mongoose';

export const connectToMongoDb = async (uri: string) => {
  try {
    await mongoose.connect(uri!, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ MongoDB connection error:', err.message);
    }
    process.exit(1); // Exit on failure
  }
};
