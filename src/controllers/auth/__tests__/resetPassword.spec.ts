import { mockAuthService, mockUserService } from '@/__mocks__/services.mock';
import { NextFunction, Request, Response } from 'express';
import resetPasswordHandler from '../resetPassword';

jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));

jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));

describe('Reset Password Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  beforeEach(() => {
    mockReq = {
      params: {
        token: 'token',
      },
      body: {
        password: 'newPassword',
      },
      query: {
        email: 'email',
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('negative test', () => {
    it('should response with status 403 and json message because token is missing', async () => {
      mockReq = {
        ...mockReq,
        params: {
          token: '',
        },
      };
      await resetPasswordHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status 400 and json message because email is missing', async () => {
      mockReq = {
        ...mockReq,
        query: {
          email: '',
        },
      };
      await resetPasswordHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status 404 and json message because no pwdResetData found in db', async () => {
      mockAuthService.getPasswordResetData.mockResolvedValue(null);
      await resetPasswordHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should response with status 404 and json message because no user found in db', async () => {
      mockAuthService.getPasswordResetData.mockResolvedValue(true as any);
      mockUserService.getOneUser.mockResolvedValue(null);
      await resetPasswordHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it('should catch error when async function fails', async () => {
      mockAuthService.getPasswordResetData.mockResolvedValue(true as any);
      mockUserService.getOneUser.mockResolvedValue(true as any);
      mockAuthService.resetUserPassword.mockRejectedValue(
        new Error('something went wrong'),
      );
      await resetPasswordHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('positive test', () => {
    it('should response with status 200 and json message', async () => {
      mockAuthService.getPasswordResetData.mockResolvedValue(true as any);
      mockUserService.getOneUser.mockResolvedValue(true as any);
      mockAuthService.resetUserPassword.mockResolvedValue(true as any);
      await resetPasswordHandler(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });
});
