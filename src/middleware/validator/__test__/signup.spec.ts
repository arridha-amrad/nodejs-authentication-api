import { Request, Response, NextFunction } from 'express';
import { validateSignupInput, validate } from '@/middleware/validator/signup';

describe('validateSignupInput', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    mockNext = jest.fn();

    mockRequest = { body: {} };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('validate signup input', () => {
    it('should return valid for correct input', () => {
      const validInput = {
        email: 'test@example.com',
        username: 'valid_username',
        password: 'ValidPass123!',
      };

      const result = validate(validInput);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should return errors for invalid email', () => {
      const invalidInput = {
        email: 'invalid-email',
        username: 'valid_username',
        password: 'ValidPass123!',
      };

      const result = validate(invalidInput);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual({
        email: 'Invalid email address',
      });
    });

    it('should sanitize username', () => {
      const inputWithHtml = {
        email: 'test@example.com',
        username: '<script>alert(1)</script>john',
        password: 'ValidPass123!',
      };
      const result = validate(inputWithHtml);
      expect(result.valid).toBe(true);
      expect(result.data?.username).toBe('john');
    });
  });

  describe('validateSignupInput middleware', () => {
    it('should call next() for valid input', () => {
      mockRequest.body = {
        email: 'test@example.com',
        username: 'valid_user',
        password: 'ValidPass123!',
      };

      validateSignupInput(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid input', () => {
      mockRequest.body = {
        email: 'invalid-email',
        username: 'valid_user',
        password: 'ValidPass123!',
      };

      validateSignupInput(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        errors: { email: 'Invalid email address' },
      });
    });

    it('should sanitize username in the request', () => {
      mockRequest.body = {
        email: 'test@example.com',
        username: '<b>username</b>',
        password: 'ValidPass123!',
      };

      validateSignupInput(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.body.username).toBe('username');
    });
  });
});
