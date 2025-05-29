import { Request, Response } from 'express';
import getAuthUser from '../getAuthUser';
import { mockUserService } from '@/__mocks__/services.mock';

jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));

describe('Get Auth User Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('negative test', () => {
    it('should response with status 401 because no userId and jti attached to req.user', async () => {
      await getAuthUser(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
    it("should response with status 404 because no user found", async () => {
      const payload = {
        id: 'userId',
        jti: 'jti',
      };
      mockReq = {
        user: payload,
      };
      mockUserService.getOneUser.mockResolvedValue(null)
      await getAuthUser(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String)
      })
    })
  });
  describe('positive test', () => {
    it('should response with status 200 and json containing user', async () => {
      const user = {
        id: 'userId',
        jti: 'jti',
      };
      mockReq = {
        user: user as any,
      };
      mockUserService.getOneUser.mockResolvedValue({
        _id: 'userId',
        email: 'user@mail.com',
      } as any);
      mockUserService.setUserResponse.mockReturnValue({
        _id: 'userId',
        email: 'user@mail.com',
      } as any);
      await getAuthUser(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: {
          _id: 'userId',
          email: 'user@mail.com',
        },
      });
    });
  });
});
