import { connectToMongoDb } from '@/database/db.mongo';
import mongoose from 'mongoose';

describe('MongoDb connection', () => {
  const originalExit = process.exit;

  afterEach(async () => {
    await mongoose.disconnect();
  });

  beforeEach(() => {
    Object.defineProperty(process, 'exit', {
      value: jest.fn() as unknown as typeof process.exit,
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(process, 'exit', {
      value: originalExit,
      writable: true,
    });
  });

  it('should connect to mongodb successfully', async () => {
    const uri = process.env.DB_URI;
    await connectToMongoDb(uri);
    expect(uri).toBeTruthy();
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should not connect to mongodb and exit', async () => {
    const uri = 'invalid uri';
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await connectToMongoDb(uri);
    expect(mongoose.connection.readyState).toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(
      'MongoDB connection error:',
      expect.any(String),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
  });
});
