import { COOKIE_OPTIONS, COOKIE_REF_TOKEN } from '@/constants';
import { LoginInput } from '@/middleware/validator/login';
import AuthService from '@/services/AuthService';
import PasswordService from '@/services/PasswordService';
import UserService from '@/services/UserService';
import { getUserAgentAndIp } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export default async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userService = new UserService();
  const pwdService = new PasswordService();
  const authService = new AuthService();

  const { identity, password } = req.body as LoginInput;

  try {
    const { ip, userAgent } = getUserAgentAndIp(req);

    const account = await userService.getOneUser(
      identity.includes('@') ? { email: identity } : { username: identity },
    );

    if (!account || !account.password) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    if (!account.isVerified) {
      res.status(403).json({ message: 'Account is not verified' });
      return;
    }

    const isPasswordMatch = await pwdService.verify(account.password, password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const { accessToken, rawRefreshToken } =
      await authService.generateAuthToken({
        jwtVersion: account.jwtVersion,
        userId: account._id,
        ip,
        userAgent,
      });

    res.cookie(COOKIE_REF_TOKEN, rawRefreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      accessToken,
      user: userService.setUserResponse(account),
    });

    return;
  } catch (err) {
    console.log('ERR : ', err);

    next(err);
  }
}
