import { Request, Response, NextFunction } from 'express';
import { validateSignupInput } from '@/middleware/validator/signup';
import { messages } from '../validator/helper';

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

  describe('Failed the validation and return response with status 400', () => {
    const invalidInputs = [
      {
        body: {
          username: 'valid_username',
          email: 'invalid-email',
          password: 'ValidPass123!',
        },
        messages: {
          email: messages.emailInvalid,
        },
      },
      {
        body: {
          username: '12',
          email: 'email',
          password: '123!',
        },
        messages: {
          email: messages.emailInvalid,
          username: messages.usernameTooShort,
          password: messages.pwdTooShort,
        },
      },
    ];
    invalidInputs.forEach(({ body, messages }) => {
      it(`username: ${body.username}, email: ${body.email}, password: ${
        body.password
      }. errors: ${JSON.stringify(messages)}`, () => {
        mockRequest = {
          body,
        };
        validateSignupInput(mockRequest as any, mockResponse as any, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          errors: expect.objectContaining(messages),
        });
      });
    });
  });

  describe('Sanitize username', () => {
    const validInputs = [
      {
        email: 'test@example.com',
        username: 'valid_user',
        password: 'ValidPass123!',
        afterSanitize: 'valid_user',
      },
      {
        email: 'test@example.com',
        username: '<script>alert(1)</script>john',
        password: 'ValidPass123!',
        afterSanitize: 'john',
      },
      {
        email: 'test@example.com',
        username: '<p>john</p>',
        password: 'ValidPass123!',
        afterSanitize: 'john',
      },
      {
        email: 'test@example.com',
        username: '<strong>john</strong>',
        password: 'ValidPass123!',
        afterSanitize: 'john',
      },
    ];
    validInputs.forEach(({ email, password, username, afterSanitize }) => {
      it(`for username: ${username}, sanitizedUsername: ${afterSanitize}, email: ${email}, password: ${password}`, () => {
        mockRequest = {
          body: {
            email,
            password,
            username,
          },
        };
        validateSignupInput(mockRequest as any, mockResponse as any, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRequest.body).toMatchObject({
          email,
          username: afterSanitize,
          password,
        });
      });
    });
  });

  describe('Passed the validation and call next()', () => {
    const validInputs = [
      {
        email: 'test@example.com',
        username: 'valid_user',
        password: 'ValidPass123!',
      },
      {
        email: 'test@example.com',
        username: 'valid_user',
        password: 'ValidPass123!',
      },
    ];
    validInputs.forEach(({ email, password, username }) => {
      it(`for username: ${username}, email: ${email}, password: ${password}`, () => {
        mockRequest = {
          body: {
            email,
            password,
            username,
          },
        };
        validateSignupInput(mockRequest as any, mockResponse as any, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRequest.body).toMatchObject({
          email,
          username,
          password,
        });
      });
    });
  });
});
