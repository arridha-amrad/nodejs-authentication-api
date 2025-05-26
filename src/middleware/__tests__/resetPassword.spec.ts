import { NextFunction, Request, Response } from 'express';
import {
  messages,
  validateResetPasswordInput,
} from '../validator/resetPassword';

describe('Reset Password Input Validation Middleware', () => {
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

  describe('Failed the validation and return', () => {
    const invalidInputs = [
      {
        body: {
          password: '123',
          confirmPassword: '123',
        },
        messages: {
          password: messages.pwdTooShort,
        },
      },
      {
        body: {
          password: '12345678',
          confirmPassword: '123',
        },
        messages: {
          password: messages.pwdMissingLowercase,
          confirmPassword: messages.pwdPasswordNotMatch,
        },
      },
      {
        body: {
          password: 'password123',
          confirmPassword: 'password123',
        },
        messages: {
          password: messages.pwdMissingUppercase,
        },
      },
      {
        body: {
          password: '123Pwd45',
          confirmPassword: '123Pwd45',
        },
        messages: {
          password: messages.pwdMissingSpecialCharacter,
        },
      },
    ];
    invalidInputs.forEach(
      ({ body: { confirmPassword, password }, messages }) => {
        it(`for password: ${password}, confirmPassword: ${confirmPassword}. ${JSON.stringify(
          messages,
        )}`, () => {
          mockReq = {
            body: {
              password,
              confirmPassword,
            },
          };
          validateResetPasswordInput(mockReq as any, mockRes as any, mockNext);
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            errors: messages,
          });
        });
      },
    );
  });

  describe('Passed the validation and call next()', () => {
    const validInputs = [
      {
        password: 'P@ssWord123$',
        confirmPassword: 'P@ssWord123$',
      },
      {
        password: 'Dota2Mikoto!',
        confirmPassword: 'Dota2Mikoto!',
      },
      {
        password: 'GatotKaca123##',
        confirmPassword: 'GatotKaca123##',
      },
      {
        password: 'Iron_M@n12',
        confirmPassword: 'Iron_M@n12',
      },
    ];
    validInputs.forEach(({ confirmPassword, password }) => {
      it(`for password: ${password}, confirmPassword: ${confirmPassword}`, () => {
        mockReq = {
          body: {
            password,
            confirmPassword,
          },
        };
        validateResetPasswordInput(mockReq as any, mockRes as any, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.body).toMatchObject({
          password,
          confirmPassword,
        });
      });
    });
  });
});
