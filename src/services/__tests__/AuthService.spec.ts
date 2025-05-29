import {
  mockActiveTokenRepo,
  mockPwdResetRepo,
  mockRefTokenRepo,
  mockTokenService,
  mockUserService,
  mockVerificationCodeRepo,
} from '@/__mocks__/services.mock';
import AuthService from '@/services/AuthService';
import { GitHub, Google } from 'arctic';
import { Types } from 'mongoose';

jest.mock('@/services/TokenService', () => ({
  __esModule: true,
  default: jest.fn(() => mockTokenService),
}));

jest.mock('@/repositories/RefreshTokenRepo', () => ({
  __esModule: true,
  default: jest.fn(() => mockRefTokenRepo),
}));

jest.mock('@/repositories/PasswordResetRepo', () => ({
  __esModule: true,
  default: jest.fn(() => mockPwdResetRepo),
}));

jest.mock('@/repositories/VerificationCodeRepo', () => ({
  __esModule: true,
  default: jest.fn(() => mockVerificationCodeRepo),
}));

jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));

jest.mock("@/repositories/ActiveTokenRepo", () => ({
  __esModule: true,
  deafult: jest.fn(() => mockActiveTokenRepo)
}))

jest.mock('arctic', () => ({
  GitHub: jest.fn().mockImplementation(() => ({
    validateAuthorizationCode: jest.fn(),
  })),
  Google: jest.fn().mockImplementation(() => ({
    validateAuthorizationCode: jest.fn(),
  })),
}));

global.fetch = jest.fn() as jest.Mock;

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(
      mockTokenService,
      mockRefTokenRepo,
      mockPwdResetRepo,
      mockUserService as any,
      mockVerificationCodeRepo,
      mockActiveTokenRepo
    )
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should accept custom dependencies when provided', () => {
      expect(authService['tokenService']).toBe(mockTokenService);
      expect(authService['refTokenRepo']).toBe(mockRefTokenRepo);
      expect(authService['pwdResetRepo']).toBe(mockPwdResetRepo);
      expect(authService['userService']).toBe(mockUserService);
      expect(authService['verificationCodeRepo']).toBe(mockVerificationCodeRepo);
      expect(authService['activeTokenRepo']).toBe(mockActiveTokenRepo);
    });

    it('should have all required dependencies initialized', () => {
      expect(authService['tokenService']).toBeDefined();
      expect(authService['refTokenRepo']).toBeDefined();
      expect(authService['pwdResetRepo']).toBeDefined();
      expect(authService['userService']).toBeDefined();
      expect(authService['verificationCodeRepo']).toBeDefined();
      expect(authService['activeTokenRepo']).toBeDefined();
    });
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
      mockTokenService.hashRandomBytes.mockResolvedValue('hashed-token');
      mockRefTokenRepo.findOne.mockResolvedValue({
        token: 'hashed-token',
      } as any);
      const result = await authService.getRefreshToken(rawToken);
      expect(result).toBeTruthy();
      expect(result?.token).toBe('hashed-token');
    });
    it('should return null if token not found', async () => {
      const rawToken = 'raw-token';
      mockTokenService.hashRandomBytes.mockResolvedValue('hashed-token');
      mockRefTokenRepo.findOne.mockResolvedValue(null);
      const result = await authService.getRefreshToken(rawToken);
      expect(result).toBeNull();
    });
  });

  describe('generateAuthToken', () => {
    it('should not delete any ref token record because old token is not included in function params', async () => {
      await authService.generateAuthToken({
        jwtVersion: "jwtVersion",
        userId: new Types.ObjectId(),
      });
      expect(mockRefTokenRepo.deleteOne).not.toHaveBeenCalled();
    });

    it('should delete one ref token record because old token is included in function params', async () => {
      await authService.generateAuthToken({
        jwtVersion: "jwtVersion",
        userId: new Types.ObjectId(),
        oldToken: 'oldRefreshToken',
      });
      expect(mockRefTokenRepo.deleteOne).toHaveBeenCalled();
    });

    it('should delete old active token record when deviceId is provided', async () => {
      await authService.generateAuthToken({
        jwtVersion: 'jwt-version',
        userId: new Types.ObjectId(),
        oldToken: 'oldRefreshToken',
        deviceId: 'currDeviceId',
      });
      expect(mockActiveTokenRepo.deleteMany).toHaveBeenCalledWith({
        deviceId: 'currDeviceId',
      });
    });

    it("should create active token record with new generated deviceId", async () => {
      await authService.generateAuthToken({
        jwtVersion: 'jwt-version',
        userId: new Types.ObjectId(),
        oldToken: 'oldRefreshToken',
      });
      expect(mockActiveTokenRepo.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    })
    it("should create active token record with current deviceId", async () => {
      await authService.generateAuthToken({
        jwtVersion: 'jwt-version',
        userId: new Types.ObjectId(),
        oldToken: 'oldRefreshToken',
        deviceId: 'currentDeviceId'
      });
      expect(mockActiveTokenRepo.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "currentDeviceId",
      );
    })

    it("should return accessToken, rawRefreshToken and hashedRefreshToken", async () => {
      mockTokenService.createJwt.mockResolvedValue("newAccessToken")
      mockTokenService.createPairToken.mockResolvedValue({
        rawToken: "rawRefreshToken",
        hashedToken: "hashedRefreshToken"
      })
      const result = await authService.generateAuthToken({
        jwtVersion: 'jwt-version',
        userId: new Types.ObjectId(),
        oldToken: 'oldRefreshToken',
        deviceId: 'currentDeviceId'
      });
      expect(result).toMatchObject({
        accessToken: "newAccessToken",
        rawRefreshToken: "rawRefreshToken",
        hashedRefreshToken: "hashedRefreshToken"
      })
    })
  });
  describe("hasBlackListed", () => {
    it("should return true because active token is not found", async () => {
      mockActiveTokenRepo.findOne.mockResolvedValue(null)
      const result = await authService.hasTokenBlackListed("jti")
      expect(result).toBe(true)
    })
    it("should return false because active token is found", async () => {
      mockActiveTokenRepo.findOne.mockResolvedValue({
        userId: new Types.ObjectId(),
        jti: "jti",
      } as any)
      const result = await authService.hasTokenBlackListed("jti")
      expect(result).toBe(false)
    })
  })

  describe("blackListToken", () => {
    it("should call blackListToken", async () => {
      await authService.blackListToken("deviceId")
      expect(mockActiveTokenRepo.deleteMany).toHaveBeenCalledWith({
        deviceId: "deviceId"
      })
    })
  })

  describe("getUserFromGithub", () => {
    const mockGithub = new GitHub('clientId', 'clientSecret', "redirectUrl");
    it('should return user data when API call succeeds', async () => {
      const mockTokens = {
        accessToken: jest.fn().mockReturnValue('mock-access-token'),
      };
      (mockGithub.validateAuthorizationCode as jest.Mock).mockResolvedValue(mockTokens);
      const mockUser = { email: 'test@example.com' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await authService.getUserFromGithub(mockGithub, 'test-code');
      expect(result).toEqual(mockUser);
      expect(mockGithub.validateAuthorizationCode).toHaveBeenCalledWith('test-code');
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });
    });
    it('should throw error when GitHub API call fails', async () => {
      const mockTokens = {
        accessToken: jest.fn().mockReturnValue('mock-access-token'),
      };
      (mockGithub.validateAuthorizationCode as jest.Mock).mockResolvedValue(mockTokens);
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });
      await expect(authService.getUserFromGithub(mockGithub, 'test-code'))
        .rejects
        .toThrow('Failed to fetch user');
    });

    it('should throw error when code validation fails', async () => {
      (mockGithub.validateAuthorizationCode as jest.Mock).mockRejectedValue(
        new Error('Invalid code')
      );
      await expect(authService.getUserFromGithub(mockGithub, 'invalid-code'))
        .rejects
        .toThrow('Invalid code');
    });
  })

  describe("getUserFromGoogle", () => {
    const mockGoogle = new Google('clientId', 'clientSecret', "redirectUrl");
    it('should return user data when API call succeeds', async () => {
      const mockTokens = {
        accessToken: jest.fn().mockReturnValue('mock-access-token'),
      };
      (mockGoogle.validateAuthorizationCode as jest.Mock).mockResolvedValue(mockTokens);
      const mockUser = { email: 'test@example.com' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await authService.getUserFromGoogle(mockGoogle, 'test-code', 'code-verifier');
      expect(result).toEqual(mockUser);
      expect(mockGoogle.validateAuthorizationCode).toHaveBeenCalledWith('test-code', 'code-verifier');
      expect(fetch).toHaveBeenCalledWith('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });
    });
    it('should throw error when Google API call fails', async () => {
      const mockTokens = {
        accessToken: jest.fn().mockReturnValue('mock-access-token'),
      };
      (mockGoogle.validateAuthorizationCode as jest.Mock).mockResolvedValue(mockTokens);
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });
      await expect(authService.getUserFromGoogle(mockGoogle, 'test-code', 'code-verifier'))
        .rejects
        .toThrow('Failed to fetch user');
    });

    it('should throw error when code validation fails', async () => {
      (mockGoogle.validateAuthorizationCode as jest.Mock).mockRejectedValue(
        new Error('Invalid code')
      );
      await expect(authService.getUserFromGoogle(mockGoogle, 'invalid-code', 'code-verifier'))
        .rejects
        .toThrow('Invalid code');
    });
  })
});
