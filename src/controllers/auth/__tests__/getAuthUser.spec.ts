import { Request, Response } from 'express';
import getAuthUser from '../getAuthUser';

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
    it('should response with status 404 because no user attached to req.user', async () => {
      await getAuthUser(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });
  describe('positive test', () => {
    it('should response with status 200 and json containing user', async () => {
      const user = {
        _id: 'userId',
        email: 'email',
      };
      mockReq = {
        user: user as any,
      };
      await getAuthUser(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user,
      });
    });
  });
});
