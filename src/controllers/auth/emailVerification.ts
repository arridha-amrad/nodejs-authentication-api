import { COOKIE_OPTIONS, COOKIE_REF_TOKEN, COOKIE_SIGNUP } from '@/constants';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import { NextFunction, Request, Response } from 'express';

export default async function emailVerificationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userService = new UserService();
    const authService = new AuthService();
    const { code, userId } = req.body;
    const storedCode = await authService.verifyVerificationCode(userId, code);
    if (!storedCode) {
      res.status(401).json({ message: 'Invalid code' });
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
      });
    res.clearCookie(COOKIE_SIGNUP, COOKIE_OPTIONS);
    res.cookie(COOKIE_REF_TOKEN, rawRefreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      user: userService.setUserResponse(account),
      accessToken,
    });
    return;
  } catch (err) {
    next(err);
  }
}
