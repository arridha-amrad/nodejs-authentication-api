import { env } from '@/env';
import ActiveTokenRepo from '@/repositories/ActiveTokenRepo';
import PasswordResetRepository from '@/repositories/PasswordResetRepo';
import RefreshTokenRepository from '@/repositories/RefreshTokenRepo';
import VerificationCodeRepository from '@/repositories/VerificationCodeRepo';
import { GitHub, Google } from 'arctic';
import { Types } from 'mongoose';
import { v4 } from 'uuid';
import TokenService from './TokenService';
import UserService from './UserService';

type TGenAuthToken = {
  userId: Types.ObjectId;
  jwtVersion: string;
  oldToken?: string;
  deviceId?: string;
};

export default class AuthService {
  constructor(
    private tokenService = new TokenService(),
    private refTokenRepo = new RefreshTokenRepository(),
    private pwdResetRepo = new PasswordResetRepository(),
    private userService = new UserService(),
    private verificationCodeRepo = new VerificationCodeRepository(),
    private activeTokenRepo = new ActiveTokenRepo(),
  ) { }

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
    return `${env.CLIENT_BASE_URL
      }/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  }
  async getRefreshToken(rawToken: string) {
    const hashedToken = await this.tokenService.hashRandomBytes(rawToken);
    const storedToken = await this.refTokenRepo.findOne({
      token: hashedToken,
    });
    return storedToken;
  }

  async generateAuthToken(data: TGenAuthToken) {
    const { jwtVersion, userId, oldToken, deviceId: currDeviceId } = data;
    if (oldToken) {
      await this.refTokenRepo.deleteOne(oldToken);
    }
    let deviceId: string;
    if (currDeviceId) {
      deviceId = currDeviceId;
      await this.activeTokenRepo.deleteMany({ deviceId });
    } else {
      deviceId = v4();
    }
    const jti = v4();
    const accessToken = await this.tokenService.createJwt({
      id: userId.toString(),
      jwtVersion,
      jti,
    });
    await this.activeTokenRepo.create(userId.toString(), jti, deviceId);
    const { hashedToken, rawToken } = await this.tokenService.createPairToken();
    await this.refTokenRepo.create({
      token: hashedToken,
      userId,
      deviceId,
    });
    return {
      hashedRefreshToken: hashedToken,
      rawRefreshToken: rawToken,
      accessToken,
    };
  }

  async hasTokenBlackListed(jti: string) {
    const result = await this.activeTokenRepo.findOne({ jti });
    return !result;
  }

  async blackListToken(deviceId: string) {
    await this.activeTokenRepo.deleteMany({ deviceId });
  }

  async getUserFromGithub(github: GitHub, code: string) {
    const tokens = await github.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }
    const user = (await response.json()) as { email: string };
    return user;
  }

  async getUserFromGoogle(google: Google, code: string, codeVerifier: string) {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }
    const user = (await response.json()) as { name: string; email: string };
    return user;
  }
}
