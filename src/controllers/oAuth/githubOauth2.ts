import { env } from '@/env';
import { NextFunction, Request, Response } from 'express';
import * as arctic from 'arctic';
import {
  emailToUsername,
  generateRandomBytes,
  getUserAgentAndIp,
} from '@/utils';
import UserService from '@/services/UserService';
import AuthService from '@/services/AuthService';
import { COOKIE_OPTIONS, COOKIE_REF_TOKEN } from '@/constants';

const github = new arctic.GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  `${env.BASE_URL}/api/${env.API_VERSION}/auth/github/callback`,
);

export const loginWithGithub = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const state = arctic.generateState();
    const scopes = ['user:email'];
    const url = github.createAuthorizationURL(state, scopes);
    res.redirect(url.toString());
    return;
  } catch (err) {
    next(err);
  }
};

export const githubOauthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code } = req.query as {
    code: string;
  };

  const { ip, userAgent } = getUserAgentAndIp(req);

  const userService = new UserService();
  const authService = new AuthService();

  try {
    const { email } = await getUserFromGithub(code);

    const account = await userService.getOneUser({ email });

    let user;

    if (!account) {
      const newUsername = `${emailToUsername(email)}${generateRandomBytes(5)}`;
      const {
        user: { id, jwtVersion },
      } = await userService.addNewUser({
        email,
        strategy: 'github',
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

    res.cookie(COOKIE_REF_TOKEN, rawRefreshToken, COOKIE_OPTIONS);

    res.status(200).json({ accessToken });

    return;
  } catch (err) {
    next(err);
  }
};

const getUserFromGithub = async (code: string) => {
  const tokens = await github.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = (await response.json()) as { email: string };

  return user;
};
