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
      res.status(401).json({ message: 'Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = await tokenService.verifyJwt(token);
    const { id, jwtVersion, jti } = payload as TokenPayload;
    if (!id || !jwtVersion || !jti) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    const hasBlackedList = await authService.hasTokenBlackListed(jti);
    if (hasBlackedList) {
      res.status(401).json({ message: 'Token has been black listed' });
      return;
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
