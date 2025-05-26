import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import { validateEmailVerificationInput } from '../validator/emailVerification';

jest.mock('@/utils', () => ({
  getCookie: jest.fn(),
}));
const mockGetCookie = getCookie as jest.Mock;

describe('Email Verification Input Validation Middleware', () => {
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
    jest.clearAllMocks();
  });
  it('should response with 401 because cookie signup is missing', () => {
    mockGetCookie.mockReturnValue({ value: undefined, name: undefined });
    validateEmailVerificationInput(mockReq as any, mockRes as any, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: expect.any(String),
    });
  });
  it('should response with 400 because validation errors', () => {
    mockReq = {
      body: {
        code: '123',
      },
    };
    mockGetCookie.mockReturnValue({ value: 'userId' });
    validateEmailVerificationInput(mockReq as any, mockRes as any, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      errors: expect.objectContaining({
        code: expect.any(String),
      }),
    });
  });
  it('should call next() because input is valid', () => {
    mockReq = {
      body: {
        code: '12345678',
      },
    };
    mockGetCookie.mockReturnValue({ value: 'userId' });
    validateEmailVerificationInput(mockReq as any, mockRes as any, mockNext);
    expect(mockReq.body).toMatchObject({
      userId: expect.any(String),
      code: expect.any(String),
    });
    expect(mockNext).toHaveBeenCalled();
  });
});
