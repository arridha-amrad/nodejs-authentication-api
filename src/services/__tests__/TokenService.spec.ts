import { errors } from 'jose';
import TokenService, { TokenPayload } from '../TokenService';

describe('TokenService', () => {
  const service = new TokenService();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create and verify a JWT', async () => {
    const data = { id: '123', jwtVersion: '1', jti: 'jti' };
    const payload: TokenPayload = data;
    const token = await service.createJwt(payload);
    expect(typeof token).toBe('string');
    const verified = await service.verifyJwt(token);
    expect(verified).toMatchObject(data);
  });

  it("should decode the token", async () => {
    const data = { id: '123', jwtVersion: '1', jti: 'jti' };
    const token = await service.createJwt(data)
    const payload = service.decodeAccessToken(token)
    expect(payload).toMatchObject(data)
  })

  it('should throw an error for expired JWT', async () => {
    const expiredToken = await new TokenService().createJwt({
      id: '123',
      jwtVersion: '1',
      jti: 'jti',
    });
    jest.advanceTimersByTime(1000 * 60 * 20); // 20 minutes
    await expect(service.verifyJwt(expiredToken)).rejects.toThrow(
      errors.JWTExpired,
    );
  });

  it("should throw an error for invalid token", async () => {
    await expect(service.verifyJwt("token")).rejects.toThrow("Invalid token")
  })

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
