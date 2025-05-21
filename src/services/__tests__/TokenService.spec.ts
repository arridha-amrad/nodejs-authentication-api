// tokenService.test.ts

import TokenService, { TokenPayload } from '../TokenService';
import { env } from '@/env';

// Set env var for test
env.JWT_SECRET = 'supersecretkey';

describe('TokenService', () => {
  const service = new TokenService();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create and verify a JWT', async () => {
    const payload: TokenPayload = { id: '123', jwtVersion: '1' };
    const token = await service.createJwt(payload);
    expect(typeof token).toBe('string');
    const verified = await service.verifyJwt(token);
    expect(verified).toMatchObject({ id: '123', jwtVersion: '1' });
  });

  it('should throw an error for expired JWT', async () => {
    const expiredToken = await new TokenService().createJwt({
      id: '123',
      jwtVersion: '1',
    });
    jest.advanceTimersByTime(1000 * 60 * 20); // 20 minutes
    await expect(service.verifyJwt(expiredToken)).rejects.toThrow(
      'Token expired',
    );
  });

  it('should generate random bytes and hash correctly', async () => {
    const raw = await service.createRandomBytes(32);
    const hash = await service.hashRandomBytes(raw);

    expect(typeof raw).toBe('string');
    expect(typeof hash).toBe('string');
    expect(hash).toHaveLength(64); // sha256 is 32 bytes = 64 hex chars
  });

  it('should create a token pair', async () => {
    const { rawToken, hashedToken } = await service.createPairToken();

    expect(typeof rawToken).toBe('string');
    expect(typeof hashedToken).toBe('string');
    expect(hashedToken).toHaveLength(64);
  });
});
