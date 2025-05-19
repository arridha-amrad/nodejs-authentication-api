import { env } from '@/env';
import PasswordResetRepository from '@/repositories/PasswordResetRepo';
import RefreshTokenRepository from '@/repositories/RefreshTokenRepo';
import VerificationCodeRepository from '@/repositories/VerificationCodeRepo';
import { Types } from 'mongoose';
import TokenService from './TokenService';
import UserService from './UserService';

type TGenAuthToken = {
  userId: Types.ObjectId;
  jwtVersion: string;
  ip?: string;
  userAgent?: string;
  oldToken?: string;
};

export default class AuthService {
  constructor(
    private tokenService = new TokenService(),
    private refTokenRepo = new RefreshTokenRepository(),
    private pwdResetRepo = new PasswordResetRepository(),
    private userService = new UserService(),
    private verificationCodeRepo = new VerificationCodeRepository(),
  ) {}

  async clearAuthSession(refreshToken: string) {
    const hashedCrt = await this.tokenService.hashRandomBytes(refreshToken);
    await this.refTokenRepo.deleteOne(hashedCrt);
  }

  async getPasswordResetData(token: string, email: string) {
    const hashedToken = await this.tokenService.hashRandomBytes(token);
    const storedPwdResetData = await this.pwdResetRepo.findOne({
      token: hashedToken,
      email,
    });
    return storedPwdResetData;
  }

  async verifyVerificationCode(userId: string, code: string) {
    const vCode = await this.verificationCodeRepo.updateOne(
      {
        code,
        userId,
        isUsed: false,
      },
      {
        isUsed: true,
      },
    );
    return vCode;
  }

  async resetUserPassword(
    userId: string,
    password: string,
    pwdResetId: string,
  ) {
    const user = await this.userService.updateUserPassword(userId, password);
    if (user) {
      await this.pwdResetRepo.deleteOne(pwdResetId);
    }
  }

  async regenerateVerificationCode(userId: string) {
    await this.verificationCodeRepo.deleteMany(userId);
    const newVerificationCode = await this.verificationCodeRepo.create(userId);
    return newVerificationCode;
  }

  async generateLinkToken(email: string) {
    const { hashedToken, rawToken } = await this.tokenService.createPairToken();
    await this.pwdResetRepo.create(email, hashedToken);
    return `${
      env.CLIENT_BASE_URL
    }/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  }

  async getRefreshToken(rawToken: string, ip?: string, userAgent?: string) {
    const hashedToken = await this.tokenService.hashRandomBytes(rawToken);
    const storedToken = await this.refTokenRepo.findOne({
      ip,
      userAgent,
      token: hashedToken,
    });
    return storedToken;
  }

  async generateAuthToken(data: TGenAuthToken) {
    const { jwtVersion, userId, ip, oldToken, userAgent } = data;
    if (oldToken) {
      await this.refTokenRepo.deleteOne(oldToken);
    }
    const accessToken = await this.tokenService.createJwt({
      id: userId.toString(),
      jwtVersion,
    });
    const { hashedToken, rawToken } = await this.tokenService.createPairToken();
    await this.refTokenRepo.create({
      token: hashedToken,
      ip,
      userAgent,
      userId,
    });
    return {
      hashedRefreshToken: hashedToken,
      rawRefreshToken: rawToken,
      accessToken,
    };
  }
}
