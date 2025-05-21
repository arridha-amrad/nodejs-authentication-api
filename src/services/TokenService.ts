import { env } from '@/env';
import crypto from 'crypto';
import { errors as JoseErrors, JWTPayload, jwtVerify, SignJWT } from 'jose';

export type TokenPayload = JWTPayload & { id: string; jwtVersion: string };

const secret = new TextEncoder().encode(env.JWT_SECRET);

export default class TokenService {
  async createJwt(payload: TokenPayload) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);
  }

  async verifyJwt(token: string) {
    try {
      const { payload } = await jwtVerify(token, secret);
      return payload;
    } catch (err) {
      if (err instanceof JoseErrors.JWTExpired) {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  }

  async createRandomBytes(length?: number) {
    return crypto.randomBytes(length ?? 64).toString('hex');
  }

  async hashRandomBytes(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createPairToken() {
    const rawToken = await this.createRandomBytes();
    const hashedToken = await this.hashRandomBytes(rawToken);
    return { rawToken, hashedToken };
  }
}
