import { CookieOptions } from 'express';

export const VERIFICATION_CODE_LENGTH = 8;
export const JWT_VERSION_LENGTH = 5;

export const COOKIE_SIGNUP = 'signup_id';

export const COOKIE_GOOGLE_CODE_VERIFIER = 'google_code_verifier';

export const COOKIE_REF_TOKEN = 'c_r_t';

export const COOKIE_OPTIONS: CookieOptions = {
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 5,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

export const GITHUB_OAUTH_SCOPES = ['user:email'];
export const GOOGLE_OAUTH_SCOPES = ['openid', 'profile', 'email'];
