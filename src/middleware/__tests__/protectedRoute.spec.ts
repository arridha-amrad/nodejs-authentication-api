import { mockTokenService, mockUserService } from '@/__mocks__/services.mock';
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
      const payload = { id: '123', jwtVersion: 1 };
      const mockUser = { _id: '123', name: 'Test User', jwtVersion: 1 };
      mockTokenService.verifyJwt.mockResolvedValue(payload);
      mockUserService.getOneUser.mockResolvedValue(mockUser as any);
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockUserService.getOneUser).toHaveBeenCalledWith({
        _id: '123',
        jwtVersion: 1,
      });
      expect(mockRequest.user).toEqual(mockUser);
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
        message: 'Missing or invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest = {
        headers: {
          authorization: 'token',
        },
      };
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Missing or invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 if token is missing after Bearer', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
      };
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 if token verification fails', async () => {
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
        message: 'Invalid token payload',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 if user is not found', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      const payload = { id: '123', jwtVersion: 1 };
      mockTokenService.verifyJwt.mockResolvedValue(payload);
      mockUserService.getOneUser.mockResolvedValue(null);
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(mockUserService.getOneUser).toHaveBeenCalledWith({
        _id: '123',
        jwtVersion: 1,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 for any unexpected error', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };

      mockTokenService.verifyJwt.mockRejectedValue(
        new Error('Unexpected error'),
      );
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 when token expired', async () => {
      mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };
      mockTokenService.verifyJwt.mockRejectedValue(
        new JoseErrors.JWTExpired('Token expired', {} as any),
      );
      await protectedRoute(mockRequest as any, mockResponse as any, mockNext);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Token expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
