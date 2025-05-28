import {
  mockAuthService,
  mockTokenService,
  mockUserService,
} from '@/__mocks__/services.mock';
import { NextFunction, Request, Response } from 'express';
import { protectedRoute } from '../protectedRoute';
import { errors as JoseErrors } from 'jose';

// Mock the dependencies
jest.mock('@/services/TokenService', () => ({
  __esModule: true,
  default: jest.fn(() => mockTokenService),
}));
jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));
jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));

describe('protectedRoute middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    mockNext = jest.fn();

    mockRequest = {
      body: {},
      headers: {
        authorization: '',
      },
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    jest.clearAllMocks();
  });

  describe('Positive test', () => {
    it('should call next() and set user in request when token is valid', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      const payload = { id: '123', jwtVersion: 1, jti: 'jti-123' };
      mockTokenService.verifyJwt.mockResolvedValue(payload);
      mockAuthService.hasTokenBlackListed.mockResolvedValue(false);
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockRequest.user).toEqual({
        id: '123',
        jti: 'jti-123',
      });
      expect(mockNext).toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Negative test', () => {
    it('should return 401 if no authorization header exists', async () => {
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is not bearer token format', async () => {
      const wrongFormat = ['token', 'Bearer'];
      wrongFormat.forEach(async (v) => {
        mockRequest = {
          headers: {
            authorization: v,
          },
        };
        await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          message: expect.any(String),
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    it('should return 401 if token verification fails and throw JoseErrors.JWTExpired', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer expiredToken',
        },
      };
      mockTokenService.verifyJwt.mockRejectedValue(
        new JoseErrors.JWTExpired('', {}),
      );
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockTokenService.verifyJwt).toHaveBeenCalledWith('expiredToken');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Token expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails and throw Error', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      };
      mockTokenService.verifyJwt.mockRejectedValue(new Error('Invalid token'));
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockTokenService.verifyJwt).toHaveBeenCalledWith('invalidToken');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token payload is invalid', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      mockTokenService.verifyJwt.mockResolvedValue({} as any); // Invalid payload
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for any unexpected error', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      mockTokenService.verifyJwt.mockResolvedValue({
        id: 'id',
        jwtVersion: 'jwtVersion',
        jti: 'jti',
      });
      mockAuthService.hasTokenBlackListed.mockRejectedValue(
        new Error('something went wrong'),
      );
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
