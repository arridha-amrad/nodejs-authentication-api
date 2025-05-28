import AuthService from '@/services/AuthService';
import TokenService, { TokenPayload } from '@/services/TokenService';
import { NextFunction, Request, Response } from 'express';
import { errors as JoseErrors } from 'jose';

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tokenService = new TokenService();
    const authService = new AuthService();
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error();
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error();
    }
    const payload = await tokenService.verifyJwt(token);
    const { id, jwtVersion, jti } = payload as TokenPayload;
    if (!id || !jwtVersion || !jti) {
      throw new Error();
    }
    const hasBlackedList = await authService.hasTokenBlackListed(jti);
    if (hasBlackedList) {
      throw new Error();
    }
    req.user = {
      id,
      jti,
    };
    next();
  } catch (err) {
    if (err instanceof JoseErrors.JWTExpired) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
    return;
  }
};
