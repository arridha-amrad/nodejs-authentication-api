import {
  mockPwdResetRepo,
  mockRefTokenRepo,
  mockTokenService,
  mockUserService,
  mockVerificationCodeRepo,
} from '@/__mocks__/services.mock';
import AuthService from '@/services/AuthService';
import { Types } from 'mongoose';

jest.mock('@/services/TokenService', () => ({
  default: jest.fn(() => mockTokenService),
}));

jest.mock('@/repositories/RefreshTokenRepo', () => ({
  default: jest.fn(() => mockRefTokenRepo),
}));

jest.mock('@/repositories/PasswordResetRepo', () => ({
  default: jest.fn(() => mockPwdResetRepo),
}));
jest.mock('@/repositories/VerificationCodeRepo', () => ({
  default: jest.fn(() => mockVerificationCodeRepo),
}));
jest.mock('@/services/UserService', () => ({
  default: jest.fn(() => mockUserService),
}));

describe('AuthService (Unit)', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(
      mockTokenService,
      mockRefTokenRepo,
      mockPwdResetRepo,
      mockUserService as any,
      mockVerificationCodeRepo,
    );
  });

  describe('clearAuthSession', () => {
    it('should hash & delete token', async () => {
      mockTokenService.hashRandomBytes.mockResolvedValue('hashed-token');
      await authService.clearAuthSession('raw-token');
      expect(mockTokenService.hashRandomBytes).toHaveBeenCalledWith(
        'raw-token',
      );
      expect(mockRefTokenRepo.deleteOne).toHaveBeenCalledWith('hashed-token');
    });
  });

  describe('getPasswordResetData', () => {
    it('should return the new created-pwd-reset-data', async () => {
      mockTokenService.hashRandomBytes.mockResolvedValue('hashed-token');
      const result = await authService.getPasswordResetData(
        'raw-token',
        'email',
      );
      expect(mockTokenService.hashRandomBytes).toHaveBeenCalledWith(
        'raw-token',
      );
      expect(mockPwdResetRepo.findOne).toHaveBeenLastCalledWith({
        token: 'hashed-token',
        email: 'email',
      });
      expect(result).toBeTruthy();
      expect(result?.token).toBe('hashed-token');
      expect(result?.email).toBe('email');
    });

    it('should return null if no records exists', async () => {
      mockPwdResetRepo.findOne.mockResolvedValue(null);
      const result = await authService.getPasswordResetData(
        'wrong token',
        'unregisteredEmail',
      );
      expect(result).toBeNull();
    });
  });

  describe('verifyVerificationCode', () => {
    it('should mark verification code as used', async () => {
      const mockUpdatedCode = {
        _id: new Types.ObjectId(),
        code: '123456',
        userId: new Types.ObjectId().toString(),
        isUsed: true,
        expiresAt: new Date(),
      };
      mockVerificationCodeRepo.updateOne.mockResolvedValue(
        mockUpdatedCode as any,
      );
      const result = await authService.verifyVerificationCode(
        mockUpdatedCode.userId,
        mockUpdatedCode.code,
      );
      expect(mockVerificationCodeRepo.updateOne).toHaveBeenCalledWith(
        {
          code: mockUpdatedCode.code,
          userId: mockUpdatedCode.userId,
          isUsed: false,
        },
        {
          isUsed: true,
        },
      );
      expect(result).toEqual(mockUpdatedCode);
    });

    it('should return null if code is invalid/already used', async () => {
      mockVerificationCodeRepo.updateOne.mockResolvedValue(null);
      const result = await authService.verifyVerificationCode(
        'user-123',
        'invalid-code',
      );
      expect(result).toBeNull();
    });
  });

  describe('resetUserPassword', () => {
    it('should update password and delete reset record', async () => {
      // Setup
      const userId = new Types.ObjectId().toString();
      const password = 'newSecurePassword123!';
      const pwdResetId = 'reset-record-id';

      mockUserService.updateUserPassword.mockResolvedValue({
        id: userId,
      } as any);
      mockPwdResetRepo.deleteOne.mockResolvedValue({ id: '1' } as any);
      await authService.resetUserPassword(userId, password, pwdResetId);
      expect(mockUserService.updateUserPassword).toHaveBeenCalledWith(
        userId,
        password,
      );
      expect(mockPwdResetRepo.deleteOne).toHaveBeenCalledWith(pwdResetId);
    });

    // 2. Error Case - Password update fails
    it('should not delete reset record if password update fails', async () => {
      const userId = 'user-123';
      const password = 'newPass';
      const pwdResetId = 'reset-id';
      mockUserService.updateUserPassword.mockResolvedValue(null);
      await authService.resetUserPassword(userId, password, pwdResetId);
      expect(mockPwdResetRepo.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('regenerateVerificationCode', () => {
    it('should return new verification code', async () => {
      const code = {
        userId: '1',
        code: 'code',
        isUsed: false,
      };
      mockVerificationCodeRepo.deleteMany.mockResolvedValue(code as any);
      mockVerificationCodeRepo.create.mockResolvedValue(code as any);
      const result = await authService.regenerateVerificationCode(code.userId);
      expect(mockVerificationCodeRepo.deleteMany).toHaveBeenCalledWith(
        code.userId,
      );
      expect(mockVerificationCodeRepo.create).toHaveBeenCalledWith(code.userId);
      expect(result).toBeTruthy();
      expect(result.userId).toEqual(code.userId);
    });
  });

  describe('generateLinkToken', () => {
    it('should return link token', async () => {
      const email = 'email';
      mockTokenService.createPairToken.mockResolvedValue({
        hashedToken: 'hashed-token',
        rawToken: 'raw-token',
      });
      mockPwdResetRepo.create.mockResolvedValue(true as any);
      const result = await authService.generateLinkToken(email);
      expect(result).toBeTruthy();
      expect(mockPwdResetRepo.create).toHaveBeenCalledWith(
        email,
        'hashed-token',
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should return storedToken', async () => {
      const rawToken = 'raw-token';
      const ip = 'ip';
      const userAgent = 'user-agent';
      mockTokenService.hashRandomBytes.mockResolvedValue('hashed-token');
      mockRefTokenRepo.findOne.mockResolvedValue({
        token: 'hashed-token',
        ip,
        userAgent,
      } as any);
      const result = await authService.getRefreshToken(rawToken, ip, userAgent);
      expect(result).toBeTruthy();
      expect(result?.token).toBe('hashed-token');
      expect(result?.ip).toBe(ip);
      expect(result?.userAgent).toBe(userAgent);
    });
    it('should return null if token not found', async () => {
      const rawToken = 'raw-token';
      const ip = 'ip';
      const userAgent = 'user-agent';
      mockTokenService.hashRandomBytes.mockResolvedValue('hashed-token');
      mockRefTokenRepo.findOne.mockResolvedValue(null);
      const result = await authService.getRefreshToken(rawToken, ip, userAgent);
      expect(result).toBeNull();
    });
  });

  describe('generateAuthToken', () => {
    it('should not delete any token from db cause old token is missing', async () => {
      const data = {
        jwtVersion: 'jwtVersion',
        userId: 'userId',
      };
      await authService.generateAuthToken({
        jwtVersion: data.jwtVersion,
        userId: new Types.ObjectId(),
      });
      expect(mockRefTokenRepo.deleteOne).not.toHaveBeenCalled();
    });

    it('should return rawToken, hashedToken, and accessToken', async () => {
      const data = {
        jwtVersion: 'jwtVersion',
        userId: 'userId',
        oldToken: 'oldToken',
        ip: 'ip',
        userAgent: 'userAgent',
      };
      mockRefTokenRepo.deleteOne.mockResolvedValue(true as any);
      mockTokenService.createJwt.mockResolvedValue('accessToken');
      mockTokenService.createPairToken.mockResolvedValue({
        hashedToken: 'newHashedToken',
        rawToken: 'newRawToken',
      });
      mockRefTokenRepo.create.mockResolvedValue(true as any);
      const result = await authService.generateAuthToken({
        jwtVersion: data.jwtVersion,
        userId: new Types.ObjectId(),
        ip: data.ip,
        userAgent: data.userAgent,
        oldToken: data.oldToken,
      });
      expect(result).toBeTruthy();
      const { accessToken, hashedRefreshToken, rawRefreshToken } = result;
      expect(accessToken).toBe('accessToken');
      expect(hashedRefreshToken).toBe('newHashedToken');
      expect(rawRefreshToken).toBe('newRawToken');
    });
  });
});
