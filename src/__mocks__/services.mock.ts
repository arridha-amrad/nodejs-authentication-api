import PasswordResetRepository from '@/repositories/PasswordResetRepo';
import RefreshTokenRepository from '@/repositories/RefreshTokenRepo';
import UserRepository from '@/repositories/UserRepo';
import VerificationCodeRepository from '@/repositories/VerificationCodeRepo';
import EmailService from '@/services/EmailService';
import PasswordService from '@/services/PasswordService';
import TokenService from '@/services/TokenService';
import UserService from '@/services/UserService';

export const mockEmailService: jest.Mocked<Omit<EmailService, 'init'>> = {
  send: jest.fn(),
};

export const mockTokenService: jest.Mocked<TokenService> = {
  hashRandomBytes: jest.fn(),
  createJwt: jest.fn(),
  createPairToken: jest.fn().mockResolvedValue({
    hashedToken: 'hashed-token',
    rawToken: 'raw-token',
  }),
  verifyJwt: jest.fn(),
  createRandomBytes: jest.fn(),
};

export const mockRefTokenRepo: jest.Mocked<RefreshTokenRepository> = {
  deleteOne: jest.fn().mockResolvedValue(true),
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

export const mockPwdResetRepo: jest.Mocked<PasswordResetRepository> = {
  create: jest.fn(),
  deleteOne: jest.fn(),
  findOne: jest.fn().mockResolvedValue({
    token: 'hashed-token',
    email: 'email',
  }),
};

export const mockVerificationCodeRepo: jest.Mocked<VerificationCodeRepository> =
  {
    create: jest.fn(),
    deleteMany: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

export const mockUserRepo: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
};

export const mockPasswordService: jest.Mocked<PasswordService> = {
  hash: jest.fn(),
  verify: jest.fn(),
};

export const mockUserService: jest.Mocked<
  Omit<UserService, 'userRepo' | 'vcRepo' | 'passwordService'>
> = {
  getOneUser: jest.fn(),
  addNewUser: jest.fn(),
  checkEmailAndUsernameUniqueness: jest.fn(),
  updateUserPassword: jest.fn(),
  verifyNewUser: jest.fn(),
};
