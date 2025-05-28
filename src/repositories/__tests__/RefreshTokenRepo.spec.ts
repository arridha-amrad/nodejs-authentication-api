import { connectToMongoDb } from '@/database/db.mongo';
import { RefreshTokenSchema, TRefreshToken } from '@/models/RefreshTokenModel';
import mongoose, { Model, model, Types } from 'mongoose';
import { v4 } from 'uuid';
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
      deviceId: v4(),
      userId: new Types.ObjectId(),
    });
  });

  it('should create new refresh token record', async () => {
    const result = await refTokenRepo.create({
      token: 'new-hashed-token',
      userId: new Types.ObjectId(),
      deviceId: v4(),
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
      token: 'hashed-token',
    });
    expect(result).toBeTruthy();
  });

  it('should return null if no record found', async () => {
    const result = await refTokenRepo.findOne({
      token: 'no-existent-hashed-token',
    });
    expect(result).toBeNull();
  });

  it('should delete token', async () => {
    await refTokenRepo.deleteOne('hashed-token');
    expect(await refTokenRepo.findOne({ token: 'hashed-token' })).toBeNull();
  });

  it('should not delete token', async () => {
    const result = await refTokenRepo.deleteOne('no-existent-hashed-token');
    expect(result).toBeNull();
  });
});
