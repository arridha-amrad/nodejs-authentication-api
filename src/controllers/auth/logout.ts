import { COOKIE_OPTIONS } from '@/constants';
import AuthService from '@/services/AuthService';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export default async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authService = new AuthService();
    const { name, value } = getCookie(req, 'refresh-token');
    if (name && value) {
      await authService.clearAuthSession(value);
      const storedToken = await authService.getRefreshToken(value);
      if (storedToken?.deviceId) {
        await authService.blackListToken(storedToken.deviceId);
      }
      res.clearCookie(name, COOKIE_OPTIONS);
    }
    res.status(200).send('Logout');
    return;
  } catch (err) {
    next(err);
  }
}
