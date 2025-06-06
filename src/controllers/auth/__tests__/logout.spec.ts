import { mockAuthService } from '@/__mocks__/services.mock';
import logoutHandler from '../logout';
import { NextFunction, Request, Response } from 'express';
import * as utils from '@/utils';
import { COOKIE_OPTIONS } from '@/constants';

jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: jest.fn(() => mockAuthService),
}));

jest.mock('@/utils', () => ({
  getCookie: jest.fn(),
}));

const mockGetCookie = utils.getCookie as jest.Mock;

describe('logout controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRequest = {
      headers: {
        authorization: '',
        'user-agent': 'jest-test',
      },
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });
  describe('Positive test', () => {
    it('should response with 200', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie-refresh-token',
        value: 'raw-refresh-token',
      });
      mockAuthService.clearAuthSession.mockResolvedValue(true as any);
      mockAuthService.getRefreshToken.mockResolvedValue({
        deviceId: 'deviceId',
      } as any);
      mockAuthService.blackListToken.mockResolvedValue(true as any);
      await logoutHandler(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'cookie-refresh-token',
        COOKIE_OPTIONS,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith('Logout');
    });
    it('should response with 200 even though cookie refresh token is missing', async () => {
      mockGetCookie.mockReturnValue({
        name: undefined,
        value: undefined,
      });
      await logoutHandler(mockRequest as any, mockResponse as any, mockNext);
      expect(mockAuthService.clearAuthSession).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(String));
    });
  });
  describe('Negative test', () => {
    it('should catch error when any async function fails', async () => {
      mockGetCookie.mockReturnValue({
        name: 'cookie-refresh-token',
        value: 'raw-refresh-token',
      });
      mockAuthService.clearAuthSession.mockRejectedValue(
        new Error('something went wrong'),
      );
      await logoutHandler(mockRequest as any, mockResponse as any, mockNext);
      expect(mockResponse.clearCookie).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
