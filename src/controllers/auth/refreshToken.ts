import { COOKIE_OPTIONS } from '@/constants';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export default async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userService = new UserService();
    const authService = new AuthService();

    const { name, value } = getCookie(req, 'refresh-token');
    if (!value || !name) {
      res.status(401).json({ message: 'Refresh token is missing' });
      return;
    }

    const storedToken = await authService.getRefreshToken(value);
    if (!storedToken) {
      res.status(404).json({ message: 'Token not found' });
      return;
    }

    const user = await userService.getOneUser({
      _id: storedToken.userId.toString(),
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { accessToken, rawRefreshToken } =
      await authService.generateAuthToken({
        jwtVersion: user.jwtVersion,
        userId: user._id,
        oldToken: storedToken.token,
        deviceId: storedToken.deviceId,
      });

    res.cookie(name, rawRefreshToken, COOKIE_OPTIONS);
    res.status(200).json({ accessToken });
    return;
  } catch (err) {
    next(err);
  }
}
