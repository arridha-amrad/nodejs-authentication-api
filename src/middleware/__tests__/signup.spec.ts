import { Request, Response, NextFunction } from 'express';
import { validateSignupInput } from '@/middleware/validator/signup';

// it('should sanitize username', () => {
//   const inputWithHtml = {
//     email: 'test@example.com',
//     username: '<script>alert(1)</script>john',
//     password: 'ValidPass123!',
//   };
//   const result = validate(inputWithHtml);
//   expect(result.valid).toBe(true);
//   expect(result.data?.username).toBe('john');
// });

describe('Signup Input Validation Middleware', () => {
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

  describe('Failed the validation and return', () => {
    const invalidInputs = [
      {
        body: {
          username: 'valid_username',
          email: 'invalid-email',
          password: 'ValidPass123!',
        },
      },
      {
        body: {
          username: '12',
          email: 'email',
          password: '123!',
        },
      },
    ];
  });

  describe('Passed the validation and call next()', () => {
    const validInputs = [
      {
        email: 'test@example.com',
        username: 'valid_user',
        password: 'ValidPass123!',
      },
    ];
  });

  describe('validate signup input', () => {
    // it('should return valid for correct input', () => {
    //   const validInput = {
    //     email: 'test@example.com',
    //     username: 'valid_username',
    //     password: 'ValidPass123!',
    //   };
    //   const result = validate(validInput);
    //   expect(result.valid).toBe(true);
    //   expect(result.data).toEqual(validInput);
    // });
  });
});
