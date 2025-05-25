import { mockAuthService, mockUserService } from '@/__mocks__/services.mock';
import { COOKIE_OPTIONS, COOKIE_REF_TOKEN, COOKIE_SIGNUP } from '@/constants';
import { NextFunction, Request, Response } from 'express';
import emailVerificationHandler from '../emailVerification';

jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));
jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));
jest.mock('@/utils', () => ({
  getUserAgentAndIp: jest.fn(() => ({
    ip: '127.0.0.1',
    userAgent: 'jest-test',
  })),
}));

describe('Email verification controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRequest = {
      body: {
        code: '123456', // Add required fields
        userId: 'user123',
      },
      headers: {
        authorization: '',
        'user-agent': 'jest-test',
      },
      // Add IP and user-agent to test getUserAgentAndIp
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 401 for invalid verification code', async () => {
    mockAuthService.verifyVerificationCode.mockResolvedValue(null);
    await emailVerificationHandler(
      mockRequest as any,
      mockResponse as any,
      mockNext,
    );
    expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledTimes(1);
    expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledWith(
      'user123',
      '123456',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid code' });
  });

  it('should return 404 for not account related to user', async () => {
    mockAuthService.verifyVerificationCode.mockResolvedValue(true as any);
    mockUserService.verifyNewUser.mockResolvedValue(null);
    await emailVerificationHandler(
      mockRequest as any,
      mockResponse as any,
      mockNext,
    );
    expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledTimes(1);
    expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledWith(
      'user123',
      '123456',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });

  it('should return 500 when generateAuthToken throws error', async () => {
    mockAuthService.verifyVerificationCode.mockResolvedValue(true as any);
    mockUserService.verifyNewUser.mockResolvedValue(true as any);
    mockAuthService.generateAuthToken.mockRejectedValue(new Error('Error'));
    await emailVerificationHandler(
      mockRequest as any,
      mockResponse as any,
      mockNext,
    );
    expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledTimes(1);
    expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledWith(
      'user123',
      '123456',
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should successfully verify email with valid code', async () => {
    mockAuthService.verifyVerificationCode.mockResolvedValueOnce(true as any);
    mockUserService.verifyNewUser.mockResolvedValueOnce({
      _id: '1',
      email: 'email',
      username: 'username',
    } as any);
    mockUserService.setUserResponse.mockReturnValue({
      _id: '1',
      email: 'email',
      username: 'username',
    } as any);
    mockAuthService.generateAuthToken.mockResolvedValue({
      accessToken: 'mock-access',
      rawRefreshToken: 'mock-refresh',
      hashedRefreshToken: 'hashed-token',
    });
    await emailVerificationHandler(
      mockRequest as any,
      mockResponse as any,
      mockNext,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      user: expect.objectContaining({
        _id: expect.any(String),
        email: expect.any(String),
      }),
      accessToken: 'mock-access',
    });
    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      COOKIE_SIGNUP,
      COOKIE_OPTIONS,
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      COOKIE_REF_TOKEN,
      'mock-refresh',
      COOKIE_OPTIONS,
    );
  });
});
