import { JWT_VERSION_LENGTH } from '@/constants';
import { TUser } from '@/models/UserModel';
import UserRepository from '@/repositories/UserRepo';
import VerificationCodeRepository from '@/repositories/VerificationCodeRepo';
import { generateRandomBytes } from '@/utils';
import PasswordService from './PasswordService';

export type TCreateUser = Pick<
  TUser,
  'email' | 'username' | 'strategy' | 'password'
>;

type TGetOneUserFilter = Partial<
  Pick<TUser, 'email' | 'username' | 'jwtVersion'> & { _id: string }
>;

export default class UserService {
  constructor(
    private userRepo = new UserRepository(),
    private passwordService = new PasswordService(),
    private vcRepo = new VerificationCodeRepository(),
  ) {}

  async getOneUser(filter: TGetOneUserFilter) {
    const appliedFilter: TGetOneUserFilter = {};
    if (filter.email) {
      appliedFilter['email'] = filter.email;
    }
    if (filter._id) {
      appliedFilter['_id'] = filter._id;
    }
    if (filter.username) {
      appliedFilter['username'] = filter.username;
    }
    if (filter.jwtVersion) {
      appliedFilter['jwtVersion'] = filter.jwtVersion;
    }
    return this.userRepo.findOne(appliedFilter);
  }

  async checkEmailAndUsernameUniqueness(email: string, username: string) {
    const userWithSameEmail = await this.userRepo.findOne({ email });
    if (userWithSameEmail) {
      return {
        constraint: 'email',
      };
    }
    const userWithSameUsername = await this.userRepo.findOne({ username });
    if (userWithSameUsername) {
      return {
        constraint: 'username',
      };
    }
  }

  async addNewUser(data: TCreateUser) {
    const { email, strategy, username, password } = data;

    const hashedPassword = password
      ? await this.passwordService.hash(password)
      : null;

    const newUser = await this.userRepo.create({
      username,
      email,
      password: hashedPassword,
      jwtVersion: generateRandomBytes(JWT_VERSION_LENGTH),
      strategy,
      isActive: strategy === 'default' ? false : true,
      isVerified: strategy === 'default' ? false : true,
    });

    let code = '';
    if (strategy === 'default') {
      const result = await this.vcRepo.create(newUser.id);
      code = result.code;
    }

    return { user: newUser, verificationCode: code };
  }

  async updateUserPassword(userId: string, password: string) {
    const hashedPassword = await this.passwordService.hash(password);
    return this.userRepo.updateOne(userId, {
      jwtVersion: generateRandomBytes(JWT_VERSION_LENGTH),
      password: hashedPassword,
    });
  }

  async verifyNewUser(userId: string) {
    const user = await this.userRepo.updateOne(userId, {
      isActive: true,
      isVerified: true,
    });
    return user;
  }

  setUserResponse(user: TUser) {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
    };
  }
}
