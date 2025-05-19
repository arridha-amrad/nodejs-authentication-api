import TokenService, { TokenPayload } from '@/services/TokenService';
import UserService from '@/repositories/UserRepo';
import { NextFunction, Request, Response } from 'express';

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tokenService = new TokenService();
    const userService = new UserService();

    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = await tokenService.verifyJwt(token);
    const { id, jwtVersion } = payload as TokenPayload;

    if (!id || jwtVersion === undefined) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    const account = await userService.findOne({ jwtVersion, _id: id });
    if (!account) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = account;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
};
