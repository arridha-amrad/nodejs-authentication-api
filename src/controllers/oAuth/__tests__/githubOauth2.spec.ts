import { mockAuthService, mockUserService } from '@/__mocks__/services.mock';
import { COOKIE_OPTIONS, COOKIE_REF_TOKEN } from '@/constants';
import {
  githubOauthCallback,
  loginWithGithub,
} from '@/controllers/oAuth/githubOauth2';
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
}));

describe('Login with Github', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });
  it('should redirect to GitHub OAuth URL', () => {
    loginWithGithub(mockReq as any, mockRes as any);
    expect(mockRes.redirect).toHaveBeenCalledWith(expect.any(String));
  });

  describe('Handle Github OAuth Callback', () => {
    beforeEach(() => {
      mockReq = {
        query: {
          code: '12345678901234567890',
        },
      };
      mockRes = {
        ...mockRes,
        cookie: jest.fn(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });
    it('should catch error when async function fails', async () => {
      mockAuthService.getUserFromGithub.mockRejectedValue(
        new Error('Invalid Code'),
      );
      await githubOauthCallback(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
    it('should create new user when no user registered with the email', async () => {
      mockAuthService.getUserFromGithub.mockResolvedValue({
        email: 'user@mail.com',
      });
      mockUserService.getOneUser.mockResolvedValue(null);
      await githubOauthCallback(mockReq as any, mockRes as any, mockNext);
      expect(mockUserService.addNewUser).toHaveBeenCalledWith({
        email: 'user@mail.com',
        strategy: 'github',
        username: 'user_email123',
      });
    });
    it('should generate auth token with the new created user data', async () => {
      mockAuthService.getUserFromGithub.mockResolvedValue({
        email: 'user@mail.com',
      });
      mockUserService.getOneUser.mockResolvedValue(null);
      mockUserService.addNewUser.mockResolvedValue({
        user: {
          id: 'newUserId',
          jwtVersion: 'newUserJwtVersion',
        },
      } as any);
      await githubOauthCallback(mockReq as any, mockRes as any, mockNext);
      expect(mockAuthService.generateAuthToken).toHaveBeenCalledWith({
        jwtVersion: 'newUserJwtVersion',
        userId: 'newUserId',
        ip: 'ip',
        userAgent: 'userAgent',
      });
    });
    it('should generate auth token when there is an email registered with github', async () => {
      mockAuthService.getUserFromGithub.mockResolvedValue({
        email: 'user@mail.com',
      });
      mockUserService.getOneUser.mockResolvedValue({
        id: 'userId',
        jwtVersion: 'jwtVersion',
      } as any);
      await githubOauthCallback(mockReq as any, mockRes as any, mockNext);
      expect(mockAuthService.generateAuthToken).toHaveBeenCalledWith({
        jwtVersion: 'jwtVersion',
        userId: 'userId',
        ip: 'ip',
        userAgent: 'userAgent',
      });
    });
    it('should response with status 200, cookie containing refresh token and json containing accessToken', async () => {
      mockAuthService.getUserFromGithub.mockResolvedValue({
        email: 'user@mail.com',
      });
      mockUserService.getOneUser.mockResolvedValue({
        id: 'userId',
        jwtVersion: 'jwtVersion',
      } as any);
      mockAuthService.generateAuthToken.mockResolvedValue({
        accessToken: 'accessToken',
        rawRefreshToken: 'rawRefreshToken',
      } as any);
      await githubOauthCallback(mockReq as any, mockRes as any, mockNext);
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
