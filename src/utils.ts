import { Request } from 'express';
import { customAlphabet } from 'nanoid';
import {
  COOKIE_GOOGLE_CODE_VERIFIER,
  COOKIE_REF_TOKEN,
  COOKIE_SIGNUP,
} from './constants';

const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const generateRandomBytes = (length?: number) => {
  const bytesLength = length ?? 10;
  const generateId = customAlphabet(alphabet, bytesLength);
  const result = generateId();
  return result;
};

export const setExpiryDate = (
  number: number,
  marker: 'hours' | 'minutes' | 'days',
) => {
  let multiply = 1000; // 1 second
  switch (marker) {
    case 'days':
      multiply = 1000 * 60 * 60 * 24;
      break;
    case 'hours':
      multiply = 1000 * 60 * 60;
      break;
    case 'minutes':
      multiply = 1000 * 60;
      break;
    default:
      break;
  }
  return new Date(Date.now() + multiply * number);
};

export const getUserAgentAndIp = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ipForwarded =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : Array.isArray(forwarded)
      ? forwarded[0].trim()
      : req.socket.remoteAddress;

  const ip = req.ip || ipForwarded;

  const userAgent = req.headers['user-agent'];

  return {
    ip,
    userAgent,
  };
};

export function emailToUsername(email: string): string {
  const localPart = email.split('@')[0] || '';
  return localPart
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

type TCookieType = 'refresh-token' | 'signup' | 'google-code-verifier';
export const getCookie = (req: Request, type: TCookieType) => {
  let value: string | undefined;
  let name: string | undefined;
  switch (type) {
    case 'google-code-verifier':
      value = req.cookies[COOKIE_GOOGLE_CODE_VERIFIER];
      name = COOKIE_GOOGLE_CODE_VERIFIER;
      break;
    case 'refresh-token':
      value = req.cookies[COOKIE_REF_TOKEN];
      name = COOKIE_REF_TOKEN;
      break;
    case 'signup':
      value = req.cookies[COOKIE_SIGNUP];
      name = COOKIE_SIGNUP;
      break;
    default:
      value = undefined;
      name = undefined;
      break;
  }
  return { value, name };
};
