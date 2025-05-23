import { mockAuthService, mockUserService } from '@/__mocks__/services.mock';
import {
  COOKIE_GOOGLE_CODE_VERIFIER,
  COOKIE_OPTIONS,
  COOKIE_REF_TOKEN,
} from '@/constants';
import {
  googleOAuth2Callback,
  loginWithGoogle,
} from '@/controllers/oAuth/googleOauth2';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';

jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));
jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));

jest.mock('@/utils', () => ({
  getUserAgentAndIp: jest.fn().mockReturnValue({
    ip: 'ip',
    userAgent: 'userAgent',
  }),
  emailToUsername: jest.fn().mockReturnValue('user_email'),
  generateRandomBytes: jest.fn().mockReturnValue('123'),
  getCookie: jest.fn(),
}));

const mockGetCookie = getCookie as jest.Mock;

describe('Login with Google', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      redirect: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });
  it('should redirect to Google OAuth URL', () => {
    loginWithGoogle(mockReq as any, mockRes as any);
    expect(mockRes.redirect).toHaveBeenCalledWith(expect.any(String));
  });

  describe('Handle Google OAuth Callback', () => {
    beforeEach(() => {
      mockReq = {
        query: {
          code: '12345678901234567890',
        },
      };
      mockRes = {
        ...mockRes,
        json: jest.fn(),
        clearCookie: jest.fn(),
      };
      jest.clearAllMocks();
    });
    it('should response with status 400 when codeVerifier are missing', async () => {
      mockGetCookie.mockResolvedValue({ value: undefined });
      await googleOAuth2Callback(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should catch error when async function fails', async () => {
      mockGetCookie.mockReturnValue({ value: 'google_code_verifier' });
      mockAuthService.getUserFromGoogle.mockRejectedValue(
        new Error('Invalid Code'),
      );
      await googleOAuth2Callback(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
    it('should create new user when no user registered with the email from google', async () => {
      mockAuthService.getUserFromGoogle.mockResolvedValue({
        email: 'user@mail.com',
      } as any);
      mockUserService.getOneUser.mockResolvedValue(null);
      await googleOAuth2Callback(mockReq as any, mockRes as any, mockNext);
      expect(mockUserService.addNewUser).toHaveBeenCalledWith({
        email: 'user@mail.com',
        strategy: 'google',
        username: 'user_email123',
      });
    });
    it('should generate auth token with the new created user data', async () => {
      mockAuthService.getUserFromGoogle.mockResolvedValue({
        email: 'user@mail.com',
      } as any);
      mockUserService.getOneUser.mockResolvedValue(null);
      mockUserService.addNewUser.mockResolvedValue({
        user: {
          id: 'newUserId',
          jwtVersion: 'newUserJwtVersion',
        },
      } as any);
      await googleOAuth2Callback(mockReq as any, mockRes as any, mockNext);
      expect(mockAuthService.generateAuthToken).toHaveBeenCalledWith({
        jwtVersion: 'newUserJwtVersion',
        userId: 'newUserId',
        ip: 'ip',
        userAgent: 'userAgent',
      });
    });
    it('should generate auth token when there is an email registered with google', async () => {
      mockAuthService.getUserFromGoogle.mockResolvedValue({
        email: 'user@mail.com',
      } as any);
      mockUserService.getOneUser.mockResolvedValue({
        id: 'userId',
        jwtVersion: 'jwtVersion',
      } as any);
      await googleOAuth2Callback(mockReq as any, mockRes as any, mockNext);
      expect(mockAuthService.generateAuthToken).toHaveBeenCalledWith({
        jwtVersion: 'jwtVersion',
        userId: 'userId',
        ip: 'ip',
        userAgent: 'userAgent',
      });
    });
    it('should response with status 200, cookie containing refresh token and json containing accessToken', async () => {
      mockAuthService.getUserFromGoogle.mockResolvedValue({
        email: 'user@mail.com',
      } as any);
      mockUserService.getOneUser.mockResolvedValue({
        id: 'userId',
        jwtVersion: 'jwtVersion',
      } as any);
      mockAuthService.generateAuthToken.mockResolvedValue({
        accessToken: 'accessToken',
        rawRefreshToken: 'rawRefreshToken',
      } as any);
      await googleOAuth2Callback(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        COOKIE_GOOGLE_CODE_VERIFIER,
        COOKIE_OPTIONS,
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        COOKIE_REF_TOKEN,
        'rawRefreshToken',
        COOKIE_OPTIONS,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'accessToken',
      });
    });
  });
});
