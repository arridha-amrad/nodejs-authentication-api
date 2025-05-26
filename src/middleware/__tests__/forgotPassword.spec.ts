import { NextFunction, Response, Request } from 'express';
import { validateForgotPasswordInput } from '../validator/forgotPassword';

describe('Forgot Password Input Validation Middleware', () => {
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
  it('should response with status 400 because validation errors', () => {
    const invalidEmail = [123, null, undefined, 'invalid', 'john.com', '@.com'];
    invalidEmail.forEach((v) => {
      mockReq = {
        body: {
          email: v,
        },
      };
      validateForgotPasswordInput(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.objectContaining({
          email: expect.any(String),
        }),
      });
    });
  });
  it('should call next() because validation is successful', () => {
    const validEmail = [
      'john.doe@mail.com',
      'john_doe@.com',
      'john_123.doe@mail.com',
    ];
    validEmail.forEach((v) => {
      mockReq = {
        body: {
          email: v,
        },
      };
      validateForgotPasswordInput(mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
