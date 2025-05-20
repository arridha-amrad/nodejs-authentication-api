import { COOKIE_OPTIONS, COOKIE_REF_TOKEN, COOKIE_SIGNUP } from '@/constants';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import { getUserAgentAndIp } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export default async function emailVerificationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userService = new UserService();
    const authService = new AuthService();

    console.log('reach here..');

    const { code, userId } = req.body;
    const { ip, userAgent } = getUserAgentAndIp(req);

    const storedCode = await authService.verifyVerificationCode(userId, code);
    if (!storedCode) {
      res.status(404).json({ message: 'Invalid code' });
      return;
    }

    const account = await userService.verifyNewUser(userId);
    if (!account) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { accessToken, rawRefreshToken } =
      await authService.generateAuthToken({
        jwtVersion: account.jwtVersion,
        userId,
        ip,
        userAgent,
      });

    console.log('after generate auth token');

    res.clearCookie(COOKIE_SIGNUP, COOKIE_OPTIONS);

    console.log('after clearCookie');

    res.cookie(COOKIE_REF_TOKEN, rawRefreshToken, COOKIE_OPTIONS);

    console.log('after set cookie ref token');

    res.status(200).json({
      user: account,
      accessToken,
    });

    return;
  } catch (err) {
    next(err);
  }
}
