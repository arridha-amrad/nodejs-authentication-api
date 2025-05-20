import {
  mockAuthService,
  mockEmailService,
  mockUserService,
} from '@/__mocks__/services.mock';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import requestResendEmailVerificationCode from '../requestResendEmailVerificationCode';

jest.mock('@/services/UserService', () => ({
  default: jest.fn(() => mockUserService),
  __esModule: true,
}));
jest.mock('@/services/EmailService', () => ({
  default: jest.fn(() => mockEmailService),
  __esModule: true,
}));
jest.mock('@/services/AuthService', () => ({
  default: jest.fn(() => mockAuthService),
  __esModule: true,
}));
jest.mock('@/utils', () => ({
  getCookie: jest.fn(),
}));

const mockGetCookie = getCookie as jest.Mock;

describe('Request Resend Email Verification Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('Negative test', () => {
    it('should response with status 400 because signup cookie not included on the request', async () => {
      mockGetCookie.mockReturnValue({
        value: undefined,
        name: undefined,
      });
      await requestResendEmailVerificationCode(
        mockReq as any,
        mockRes as any,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });

    it('should response with status 404 because there is no user have id like signup-cookie value', async () => {
      mockGetCookie.mockReturnValue({
        value: 'cookie',
      });
      mockUserService.getOneUser.mockResolvedValue(null);
      await requestResendEmailVerificationCode(
        mockReq as any,
        mockRes as any,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should response with status 404 because there is no user have id like signup-cookie value', async () => {
      mockGetCookie.mockReturnValue({
        value: 'cookie',
      });
      mockUserService.getOneUser.mockResolvedValue({
        isVerified: true,
        _id: new Types.ObjectId(),
        email: 'email',
      } as any);
      await requestResendEmailVerificationCode(
        mockReq as any,
        mockRes as any,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User has been verified',
      });
    });

    it('should catch error when async function fails', async () => {
      mockGetCookie.mockReturnValue({
        value: 'cookie',
      });
      mockUserService.getOneUser.mockResolvedValue({
        isVerified: false,
        _id: new Types.ObjectId(),
        email: 'email',
      } as any);
      mockAuthService.regenerateVerificationCode.mockRejectedValue(
        new Error('Failed to regenerate verification code'),
      );
      await requestResendEmailVerificationCode(
        mockReq as any,
        mockRes as any,
        mockNext,
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });
  });

  describe('positive test', () => {
    it('should return 201 with json message', async () => {
      mockGetCookie.mockReturnValue({
        value: 'cookie',
      });
      mockUserService.getOneUser.mockResolvedValue({
        isVerified: false,
        _id: new Types.ObjectId(),
        email: 'email',
      } as any);
      mockAuthService.regenerateVerificationCode.mockResolvedValue({
        code: 'code',
      } as any);
      mockEmailService.send.mockResolvedValue(true as any);
      await requestResendEmailVerificationCode(
        mockReq as any,
        mockRes as any,
        mockNext,
      );
      expect(mockNext).not.toHaveBeenCalledTimes(1);
      expect(mockEmailService.send).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });
});
