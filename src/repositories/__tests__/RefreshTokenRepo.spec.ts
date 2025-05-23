import { connectToMongoDb } from '@/database/db.mongo';
import { RefreshTokenSchema, TRefreshToken } from '@/models/RefreshTokenModel';
import mongoose, { Model, model, Types } from 'mongoose';
import RefreshTokenRepository from '../RefreshTokenRepo';

let RefTokenModel: Model<TRefreshToken>;
let refTokenRepo: RefreshTokenRepository;

describe('Refresh Token Repository', () => {
  beforeAll(async () => {
    await connectToMongoDb(process.env.DB_URI);
    RefTokenModel =
      mongoose.models.RefreshToken ||
      model<TRefreshToken>('RefreshToken', RefreshTokenSchema);
    refTokenRepo = new RefreshTokenRepository();
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });
  beforeEach(async () => {
    await RefTokenModel.deleteMany({});
    await RefTokenModel.create({
      token: 'hashed-token',
      ip: 'ip',
      userAgent: 'user-agent',
      userId: new Types.ObjectId(),
    });
  });

  it('should create new refresh token record', async () => {
    const result = await refTokenRepo.create({
      token: 'new-hashed-token',
      userId: new Types.ObjectId(),
      ip: 'ip',
      userAgent: 'user-agent',
    });
    expect(result).toBeTruthy();
  });

  it('should not create record with missing token', async () => {
    await expect(
      RefTokenModel.create({ userId: 'userId23' }),
    ).rejects.toThrow();
  });

  it('should find one record', async () => {
    const result = await refTokenRepo.findOne({
      ip: 'ip',
      token: 'hashed-token',
      userAgent: 'user-agent',
    });
    expect(result).toBeTruthy();
  });

  it('should return null if no record found', async () => {
    const result = await refTokenRepo.findOne({
      ip: 'ip',
      token: 'no-existent-hashed-token',
      userAgent: 'user-agent',
    });
    expect(result).toBeNull();
  });
});
