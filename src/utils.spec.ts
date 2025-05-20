import {
  generateRandomBytes,
  setExpiryDate,
  getUserAgentAndIp,
  emailToUsername,
  getCookie,
  formatZodErrors,
} from './utils'; // Adjust path
import { Request } from 'express';
import {
  COOKIE_GOOGLE_CODE_VERIFIER,
  COOKIE_REF_TOKEN,
  COOKIE_SIGNUP,
} from './constants';
import { z, ZodError } from 'zod';

describe('Utils', () => {
  describe('generateRandomBytes', () => {
    it('should generate a random string of default length (10)', () => {
      const id = generateRandomBytes();
      expect(typeof id).toBe('string');
      expect(id).toHaveLength(10);
    });

    it('should generate a random string of custom length', () => {
      const id = generateRandomBytes(20);
      expect(id).toHaveLength(20);
    });
  });

  describe('setExpiryDate', () => {
    const now = 1_000_000_000_000;

    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should add days correctly', () => {
      const result = setExpiryDate(1, 'days');
      expect(result.getTime()).toBe(now + 1000 * 60 * 60 * 24);
    });

    it('should add hours correctly', () => {
      const result = setExpiryDate(2, 'hours');
      expect(result.getTime()).toBe(now + 2 * 1000 * 60 * 60);
    });

    it('should add minutes correctly', () => {
      const result = setExpiryDate(3, 'minutes');
      expect(result.getTime()).toBe(now + 3 * 1000 * 60);
    });

    it('should default to seconds if marker is unknown', () => {
      // @ts-expect-error: intentionally invalid marker
      const result = setExpiryDate(5, 'invalid');
      expect(result.getTime()).toBe(now + 5 * 1000);
    });
  });

  describe('getUserAgentAndIp', () => {
    it('should extract IP and user-agent from headers', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '123.123.123.123',
          'user-agent': 'Mozilla',
        },
        ip: '',
        socket: { remoteAddress: '456.456.456.456' },
      } as unknown as Request;

      const result = getUserAgentAndIp(mockReq);
      expect(result).toEqual({
        ip: '123.123.123.123',
        userAgent: 'Mozilla',
      });
    });

    it('should fallback to req.ip or remoteAddress', () => {
      const mockReq = {
        headers: {},
        ip: '789.789.789.789',
        socket: { remoteAddress: '999.999.999.999' },
      } as unknown as Request;

      const result = getUserAgentAndIp(mockReq);
      expect(result.ip).toBe('789.789.789.789');
    });
  });

  describe('emailToUsername', () => {
    it('should convert email to valid username', () => {
      const result = emailToUsername('Test.Email+foo@example.com');
      expect(result).toBe('test_email_foo');
    });

    it('should strip leading/trailing underscores', () => {
      const result = emailToUsername('__Test__@example.com');
      expect(result).toBe('test');
    });
  });

  describe('getCookie', () => {
    it('should get refresh-token cookie', () => {
      const req = {
        cookies: {
          [COOKIE_REF_TOKEN]: 'ref-token',
        },
      } as unknown as Request;

      const result = getCookie(req, 'refresh-token');
      expect(result).toEqual({
        name: COOKIE_REF_TOKEN,
        value: 'ref-token',
      });
    });

    it('should get signup cookie', () => {
      const req = {
        cookies: {
          [COOKIE_SIGNUP]: 'userId',
        },
      } as unknown as Request;

      const result = getCookie(req, 'signup');
      expect(result).toEqual({
        name: COOKIE_SIGNUP,
        value: 'userId',
      });
    });

    it('should get google-code-verifier cookie', () => {
      const req = {
        cookies: {
          [COOKIE_GOOGLE_CODE_VERIFIER]: 'code-verifier',
        },
      } as unknown as Request;

      const result = getCookie(req, 'google-code-verifier');
      expect(result).toEqual({
        name: COOKIE_GOOGLE_CODE_VERIFIER,
        value: 'code-verifier',
      });
    });

    it('should return undefined for unknown type', () => {
      const req = { cookies: {} } as Request;
      // @ts-expect-error test invalid type
      const result = getCookie(req, 'invalid');
      expect(result).toEqual({ name: undefined, value: undefined });
    });
  });

  describe('formatZodErrors', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    it('should return formatted error messages', () => {
      const result = schema.safeParse({ email: 'invalid', password: '123' });
      expect(result.success).toBe(false);

      const formatted = formatZodErrors(result.error as ZodError<any>);
      expect(formatted).toEqual({
        email: expect.any(String),
        password: expect.any(String),
      });
    });
  });
});
