import { mockAuthService, mockUserService } from '@/__mocks__/services.mock';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import refreshTokenHandler from '../refreshToken';
import { Types } from 'mongoose';
import { COOKIE_OPTIONS } from '@/constants';

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
    userAgent: 'user-agent',
  }),
  getCookie: jest.fn(),
}));

const mockGetCookie = getCookie as jest.Mock;

describe('Refresh token controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    mockReq = {
      ip: 'ip',
      headers: {
        'user-agent': 'user-agent',
      },
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('negative test', () => {
    it('should response with status code 401 because the refresh token is missing', async () => {
      mockGetCookie.mockReturnValue({
        name: undefined,
        value: undefined,
      });
      await refreshTokenHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status code 404 because no token found in db', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie',
        value: 'raw-token',
      });
      mockAuthService.getRefreshToken.mockResolvedValue(null);
      await refreshTokenHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status code 404 because no user owned the token', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie',
        value: 'raw-token',
      });
      mockAuthService.getRefreshToken.mockResolvedValue({
        userId: new Types.ObjectId(),
      } as any);
      mockUserService.getOneUser.mockResolvedValue(null);
      await refreshTokenHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should catch error when async function fails', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie',
        value: 'raw-token',
      });
      mockAuthService.getRefreshToken.mockRejectedValue(
        new Error('Something went wrong'),
      );
      await refreshTokenHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
    it('should catch error when async function fails', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie',
        value: 'raw-token',
      });
      mockAuthService.getRefreshToken.mockResolvedValue({
        userId: new Types.ObjectId(),
      } as any);
      mockUserService.getOneUser.mockResolvedValue(true as any);
      mockAuthService.generateAuthToken.mockRejectedValue(
        new Error('Something went wrong'),
      );
      await refreshTokenHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('positive test', () => {
    it('should respons with status code 200 and json containing accessToken', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie',
        value: 'raw-token',
      });
      mockAuthService.getRefreshToken.mockResolvedValue({
        userId: new Types.ObjectId(),
      } as any);
      mockUserService.getOneUser.mockResolvedValue(true as any);
      mockAuthService.generateAuthToken.mockResolvedValue({
        accessToken: 'access-token',
        rawRefreshToken: 'raw-refresh-token',
        hashedRefreshToken: 'hashed-refresh-token',
      });
      await refreshTokenHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'cookie',
        'raw-refresh-token',
        COOKIE_OPTIONS,
      );
    });
  });
});
