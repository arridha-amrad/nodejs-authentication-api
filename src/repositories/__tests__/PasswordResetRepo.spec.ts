import { connectToMongoDb } from '@/database/db.mongo';
import {
  PasswordResetSchema,
  TPasswordReset,
} from '@/models/PasswordResetModel';
import mongoose, { model, Model } from 'mongoose';
import PasswordResetRepository from '../PasswordResetRepo';

let PwdModel: Model<TPasswordReset>;
let pwdResetRepo: PasswordResetRepository;

describe('Password Reset Repository', () => {
  let dummyId: string;
  beforeAll(async () => {
    await connectToMongoDb(process.env.DB_URI);
    PwdModel =
      mongoose.models.PasswordReset ||
      model<TPasswordReset>('PasswordReset', PasswordResetSchema);
    pwdResetRepo = new PasswordResetRepository();
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });
  beforeEach(async () => {
    await PwdModel.deleteMany({});
    const newData = await PwdModel.create({
      email: 'email@mail.com',
      token: 'token',
    });
    dummyId = newData.id;
  });

  it('should create new password reset data in db', async () => {
    const result = await pwdResetRepo.create('valid@mail.com', 'hashedToken');
    expect(result).toBeTruthy();
  });

  it('should not create record with missing email', async () => {
    await expect(PwdModel.create({ token: 'some-token' })).rejects.toThrow();
  });

  it('should find one of pwd reset data', async () => {
    const result = await pwdResetRepo.findOne({ _id: dummyId });
    expect(result).toBeTruthy();
    expect(result?.email).toBe('email@mail.com');
    expect(result?.token).toBe('token');
  });

  it('should return null if password reset entry is not found', async () => {
    const result = await pwdResetRepo.findOne({
      email: 'nonexistent@mail.com',
    });
    expect(result).toBeNull();
  });

  it('should delete one of pwd reset data', async () => {
    await pwdResetRepo.deleteOne(dummyId);
    const result = await pwdResetRepo.findOne({ _id: dummyId });
    expect(result).toBeNull();
  });

  it('should not fail when deleting non-existent data', async () => {
    await pwdResetRepo.deleteOne(dummyId);
    const result = await pwdResetRepo.deleteOne(dummyId);
    expect(result).toBeNull();
  });
});
