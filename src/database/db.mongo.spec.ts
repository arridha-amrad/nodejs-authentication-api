import mongoose from 'mongoose';
import { connectToMongoDb } from '@/database/db.mongo';

jest.mock('mongoose');

describe('connectToMongoDb', () => {
  const mockedConnect = mongoose.connect as jest.Mock;
  const originalExit = process.exit;

  beforeEach(() => {
    jest.clearAllMocks();

    // 👇 Properly override process.exit without type conflict
    Object.defineProperty(process, 'exit', {
      value: jest.fn() as unknown as typeof process.exit,
      writable: true,
    });
  });

  afterAll(() => {
    // ✅ Restore original process.exit
    Object.defineProperty(process, 'exit', {
      value: originalExit,
      writable: true,
    });
  });

  it('should connect successfully to MongoDB', async () => {
    mockedConnect.mockResolvedValueOnce({} as any);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await connectToMongoDb('mongodb://fake-uri');

    expect(mockedConnect).toHaveBeenCalledWith('mongodb://fake-uri', {
      serverSelectionTimeoutMS: 5000,
    });
    expect(logSpy).toHaveBeenCalledWith('✅ MongoDB connected');
    logSpy.mockRestore();
  });

  it('should handle connection error and call process.exit', async () => {
    mockedConnect.mockRejectedValueOnce(new Error('connection failed'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await connectToMongoDb('mongodb://invalid-uri');

    expect(errorSpy).toHaveBeenCalledWith(
      '❌ MongoDB connection error:',
      'connection failed',
    );

    // 👇 Assert that process.exit was called with 1
    expect(process.exit).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
  });
});
