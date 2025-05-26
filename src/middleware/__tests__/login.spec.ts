import { NextFunction, Request, Response } from 'express';
import { validateLoginInput } from '../validator/login';

describe('Login Input Validation Middleware', () => {
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
    const invalidReqBody = [
      {
        body: {
          identity: '',
          password: '',
        },
        messages: {
          identity: 'Identity is required',
          password: 'Password must be at least 6 characters',
        },
      },
      {
        body: {
          identity: '@mail.com',
          password: '1234',
        },
        messages: {
          identity: 'Must be a valid email or username',
          password: 'Password must be at least 6 characters',
        },
      },
      {
        body: {
          identity: 'username',
          password: '1234',
        },
        messages: {
          password: 'Password must be at least 6 characters',
        },
      },
    ];
    invalidReqBody.forEach(({ body, messages }) => {
      it(`for identity: ${body.identity} password: ${body.password}`, () => {
        mockReq = {
          body,
        };
        validateLoginInput(mockReq as any, mockRes as any, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          errors: expect.objectContaining(messages),
        });
      });
    });
  });

  describe('Passed the validation and call next()', () => {
    const validReqBody = [
      {
        identity: 'john_doe.doe',
        password: 'P@ss123',
      },
      {
        identity: 'john_doe@mail.com',
        password: '123456',
      },
      {
        identity: 'john.doe@mail.com',
        password: '_john123',
      },
    ];

    validReqBody.forEach(({ identity, password }) => {
      it(`for identity: ${identity} password: ${password}`, () => {
        mockReq.body = { identity, password };
        validateLoginInput(mockReq as any, mockRes as any, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.body).toMatchObject({ identity, password });
      });
    });
  });
});
