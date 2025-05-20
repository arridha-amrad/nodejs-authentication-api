import {
  mockAuthService,
  mockPasswordService,
  mockUserService,
} from '@/__mocks__/services.mock';
import login from '../login';
import { Response, Request, NextFunction } from 'express';
import { COOKIE_OPTIONS, COOKIE_REF_TOKEN } from '@/constants';

jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));
jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));
jest.mock('@/services/PasswordService', () => ({
  __esModule: true,
  default: jest.fn(() => mockPasswordService),
}));
jest.mock('@/utils', () => ({
  getUserAgentAndIp: jest.fn(() => ({
    ip: '127.0.0.1',
    userAgent: 'jest-test',
  })),
}));

describe('unit test for login controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  beforeEach(async () => {
    mockNext = jest.fn();
    mockRequest = {
      body: {
        identity: 'john_doe',
        password: '123456',
      },
      headers: {
        'user-agent': 'jest-test',
      },
      // Add IP and user-agent to test getUserAgentAndIp
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('edge test', () => {
    it('should response 404 because account not found', async () => {
      mockUserService.getOneUser.mockResolvedValue(null);
      await login(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response 404 because account found but has no password', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        password: null,
      } as any);
      await login(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response 403 because account found but not verified yet', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        password: 'goodPassword',
        isVerified: false,
      } as any);
      await login(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response 401 because account found but the password did not match', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        password: 'goodPassword',
        isVerified: true,
      } as any);
      mockPasswordService.verify.mockResolvedValue(false);
      await login(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should catch error when async function fails', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        password: 'goodPassword',
        isVerified: true,
      } as any);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateAuthToken.mockRejectedValue(
        new Error('Something went wrong'),
      );
      await login(mockRequest as any, mockResponse as any, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('happy test', () => {
    it('should return response in json format including user and accessToken', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        password: 'goodPassword',
        isVerified: true,
      } as any);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateAuthToken.mockResolvedValue({
        accessToken: 'access-token',
        rawRefreshToken: 'raw-refresh-token',
        hashedRefreshToken: 'hashed-refresh-token',
      });
      const userAsResponse = {
        _id: 'userId',
        email: 'email',
      };
      mockUserService.setUserResponse.mockReturnValue(userAsResponse as any);
      await login(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: 'access-token',
        user: userAsResponse,
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        COOKIE_REF_TOKEN,
        'raw-refresh-token',
        COOKIE_OPTIONS,
      );
    });
  });
});
