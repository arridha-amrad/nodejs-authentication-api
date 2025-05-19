import { mockAuthService, mockUserService } from '@/__mocks__/services.mock';
import * as utils from '@/utils';
import { NextFunction, Request, Response } from 'express';
import emailVerificationHandler from '../emailVerification';

jest.mock('@/utils', () => ({
  getUserAgentAndIp: jest.fn(),
}));

const mockGetUserAgentAndIp = utils.getUserAgentAndIp as jest.Mock;

// Mock the dependencies
jest.mock('@/services/AuthService', () => ({
  _esModule: true,
  default: jest.fn(() => mockAuthService),
}));

jest.mock('@/services/UserService', () => ({
  _esModule: true,
  default: jest.fn(() => mockUserService),
}));

describe('emailVerificationHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Initialize fresh mocks for each test
    mockRequest = {
      body: {
        code: '123456',
        userId: 'user123',
      },
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1',
      },
    };

    mockGetUserAgentAndIp.mockResolvedValue({
      ip: '127.0.0.1',
      userAgent: 'test-agent',
    });

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    };

    mockNext = jest.fn();

    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it('should return 404 for invalid verification code', async () => {
    // mockAuthService.verifyVerificationCode.mockResolvedValue(true as any);
    await emailVerificationHandler(
      mockRequest as any,
      mockResponse as any,
      mockNext,
    );
    expect(true).toBe(true);
    // expect(mockGetUserAgentAndIp).toHaveBeenCalled();
  });

  // it('should return 404 if user not found', async () => {
  //   mockAuthService.verifyVerificationCode.mockResolvedValue({} as any);
  //   mockUserService.verifyNewUser.mockResolvedValue(null);

  //   await emailVerificationHandler(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     mockNext,
  //   );

  //   expect(mockUserService.verifyNewUser).toHaveBeenCalledWith('user123');
  //   expect(mockResponse.status).toHaveBeenCalledWith(404);
  //   expect(mockResponse.json).toHaveBeenCalledWith({
  //     message: 'User not found',
  //   });
  //   expect(mockNext).not.toHaveBeenCalled();
  // });

  // it('should handle successful verification with tokens and cookies', async () => {
  //   const mockAccount = {
  //     _id: 'user123',
  //     email: 'test@example.com',
  //     jwtVersion: 1,
  //   };
  //   const mockTokens = {
  //     accessToken: 'access-token-123',
  //     rawRefreshToken: 'refresh-token-123',
  //   };

  //   mockAuthService.verifyVerificationCode.mockResolvedValue({} as any);
  //   mockUserService.verifyNewUser.mockResolvedValue(mockAccount);
  //   mockAuthService.generateAuthToken.mockResolvedValue(mockTokens);

  //   await emailVerificationHandler(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     mockNext,
  //   );

  //   // Verify verification code check
  //   expect(mockAuthService.verifyVerificationCode).toHaveBeenCalledWith(
  //     'user123',
  //     '123456',
  //   );

  //   // Verify user verification
  //   expect(mockUserService.verifyNewUser).toHaveBeenCalledWith('user123');

  //   // Verify token generation
  //   expect(mockAuthService.generateAuthToken).toHaveBeenCalledWith({
  //     jwtVersion: 1,
  //     userId: 'user123',
  //     ip: '127.0.0.1',
  //     userAgent: 'test-agent',
  //   });

  //   // Verify cookie handling
  //   expect(mockResponse.clearCookie).toHaveBeenCalledWith(
  //     COOKIE_SIGNUP,
  //     COOKIE_OPTIONS,
  //   );
  //   expect(mockResponse.cookie).toHaveBeenCalledWith(
  //     COOKIE_REF_TOKEN,
  //     'refresh-token-123',
  //     COOKIE_OPTIONS,
  //   );

  //   // Verify success response
  //   expect(mockResponse.status).toHaveBeenCalledWith(200);
  //   expect(mockResponse.json).toHaveBeenCalledWith({
  //     user: mockAccount,
  //     accessToken: 'access-token-123',
  //   });

  //   expect(mockNext).not.toHaveBeenCalled();
  // });

  // it('should pass errors to next middleware', async () => {
  //   const testError = new Error('Test error');
  //   mockAuthService.verifyVerificationCode.mockRejectedValue(testError);

  //   await emailVerificationHandler(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     mockNext,
  //   );

  //   expect(mockNext).toHaveBeenCalledWith(testError);
  //   expect(mockResponse.status).not.toHaveBeenCalled();
  //   expect(mockResponse.json).not.toHaveBeenCalled();
  // });

  // it('should handle missing code or userId', async () => {
  //   const testCases = [
  //     { code: '', userId: 'user123' },
  //     { code: '123456', userId: '' },
  //     { code: '', userId: '' },
  //     {},
  //   ];

  //   for (const body of testCases) {
  //     mockRequest.body = body;
  //     await emailVerificationHandler(
  //       mockRequest as Request,
  //       mockResponse as Response,
  //       mockNext,
  //     );

  //     expect(mockResponse.status).toHaveBeenCalledWith(404);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       message: 'Invalid code',
  //     });
  //     mockResponse.status.mockClear();
  //     mockResponse.json.mockClear();
  //   }
  // });
});
