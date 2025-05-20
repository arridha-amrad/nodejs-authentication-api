import {
  mockAuthService,
  mockEmailService,
  mockUserService,
} from '@/__mocks__/services.mock';
import { NextFunction, Request, Response } from 'express';
import forgotPasswordHandler from '../forgotPassword';

jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));
jest.mock('@/services/EmailService', () => ({
  __esModule: true,
  default: jest.fn(() => mockEmailService),
}));
jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));

describe('forgot password controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRequest = {
      body: {
        email: 'valid@mail.com',
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
  describe('negative test', () => {
    it('should response with status 404 for no user registered with the email', async () => {
      mockUserService.getOneUser.mockResolvedValue(null);
      await forgotPasswordHandler(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status 404 for no user registered with the email', async () => {
      mockUserService.getOneUser.mockResolvedValue(null);
      await forgotPasswordHandler(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status 404 when account found but is not verified', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        isVerified: false,
      } as any);
      await forgotPasswordHandler(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should catch error when async function fails', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        isVerified: true,
      } as any);
      mockAuthService.generateLinkToken.mockResolvedValue('link token');
      mockEmailService.send.mockRejectedValue(
        new Error('Failed to send the email'),
      );
      await forgotPasswordHandler(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('positive test', () => {
    it('should response with status 200 and json containing a message', async () => {
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        isVerified: true,
      } as any);
      mockAuthService.generateLinkToken.mockResolvedValue('link token');
      mockEmailService.send.mockResolvedValue(true as any);
      await forgotPasswordHandler(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
