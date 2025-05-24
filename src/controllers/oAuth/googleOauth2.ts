import {
  COOKIE_GOOGLE_CODE_VERIFIER,
  COOKIE_OPTIONS,
  COOKIE_REF_TOKEN,
  GOOGLE_OAUTH_SCOPES,
} from '@/constants';
import { env } from '@/env';

import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import {
  emailToUsername,
  generateRandomBytes,
  getCookie,
  getUserAgentAndIp,
} from '@/utils';
import * as arctic from 'arctic';
import { NextFunction, Request, Response } from 'express';

const google = new arctic.Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.BASE_URL}/api/${env.API_VERSION}/oauth/google/callback`,
);

export async function loginWithGoogle(_req: Request, res: Response) {
  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const url = google.createAuthorizationURL(
    state,
    codeVerifier,
    GOOGLE_OAUTH_SCOPES,
  );
  res.cookie(COOKIE_GOOGLE_CODE_VERIFIER, codeVerifier, COOKIE_OPTIONS);
  res.redirect(url.toString());
  return;
}

export async function googleOAuth2Callback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { code } = req.query as {
    code: string;
  };
  const { value: codeVerifier } = getCookie(req, 'google-code-verifier');
  if (!code || !codeVerifier) {
    res.status(400).json({
      message: 'Invalid request. Code and codeVerifier are missing',
    });
    return;
  }
  const { ip, userAgent } = getUserAgentAndIp(req);
  try {
    const userService = new UserService();
    const authService = new AuthService();
    const { email } = await authService.getUserFromGoogle(
      google,
      code,
      codeVerifier,
    );
    const account = await userService.getOneUser({ email });
    let user;
    if (!account) {
      const newUsername = `${emailToUsername(email)}${generateRandomBytes(5)}`;
      const {
        user: { id, jwtVersion },
      } = await userService.addNewUser({
        email,
        strategy: 'google',
        username: newUsername,
      });
      user = {
        id,
        jwtVersion,
      };
    } else {
      const { id, jwtVersion } = account;
      user = {
        id,
        jwtVersion,
      };
    }
    const { accessToken, rawRefreshToken } =
      await authService.generateAuthToken({
        jwtVersion: user.jwtVersion,
        userId: user.id,
        ip,
        userAgent,
      });
    res.clearCookie(COOKIE_GOOGLE_CODE_VERIFIER, COOKIE_OPTIONS);
    res.cookie(COOKIE_REF_TOKEN, rawRefreshToken, COOKIE_OPTIONS);
    res.status(200).json({ accessToken });
    return;
  } catch (err) {
    next(err);
  }
}
