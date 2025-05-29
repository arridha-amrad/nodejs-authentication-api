import { JWT_VERSION_LENGTH } from '@/constants';
import { TUser as User, UserSchema as userSchema } from '@/models/UserModel';
import { generateRandomBytes } from '@/utils';
import mongoose, { Model, model } from 'mongoose';
import UserService, { TCreateUser } from '../UserService';

let UserModel: Model<User>;
let userService: UserService;

describe('testing for UserService', () => {
  let dummyId: string;
  let dummy: User;

  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URI);

    // ✅ Prevent OverwriteModelError
    UserModel = mongoose.models.User || model<User>('User', userSchema);

    userService = new UserService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    const newUser = await UserModel.create({
      username: 'john_doe',
      email: 'john@example.com',
      jwtVersion: generateRandomBytes(JWT_VERSION_LENGTH),
      strategy: 'default',
      password: '12345',
    });
    dummy = newUser;
    dummyId = newUser.id;
  });

  describe('getOneUser', () => {
    it('should get one user by id', async () => {
      const user = await userService.getOneUser({ _id: dummyId });
      expect(user).toBeTruthy();
      expect(user?.username).toBe(dummy.username);
    });
    it('should get one user by username', async () => {
      const user = await userService.getOneUser({ username: dummy.username });
      expect(user).toBeTruthy();
      expect(user?.username).toBe(dummy.username);
    });
    it('should get one user by id', async () => {
      const user = await userService.getOneUser({ email: dummy.email });
      expect(user).toBeTruthy();
      expect(user?.username).toBe(dummy.username);
    });
    it('should return null because the email is not registered', async () => {
      const user = await userService.getOneUser({ email: 'xxx@mail.com' });
      expect(user).toBeNull();
    });
  });

  describe('checkEmailAndUsernameUniqueness', () => {
    it('should return {constraint: email}', async () => {
      const userWithSameEmail =
        await userService.checkEmailAndUsernameUniqueness(
          'john@example.com',
          'xxx',
        );
      expect(userWithSameEmail).toBeTruthy();
      expect(userWithSameEmail?.constraint).toBe('email');
    });
    it('should return {constraint: username}', async () => {
      const userWithSameEmail =
        await userService.checkEmailAndUsernameUniqueness(
          'xxx@example.com',
          'john_doe',
        );
      expect(userWithSameEmail).toBeTruthy();
      expect(userWithSameEmail?.constraint).toBe('username');
    });
    it('should return undefined', async () => {
      const userWithSameEmail =
        await userService.checkEmailAndUsernameUniqueness(
          'xxx@example.com',
          'xxx',
        );
      expect(userWithSameEmail).toBeUndefined();
    });
  });

  describe('addNewUser', () => {
    const data: TCreateUser = {
      email: 'xxx@mail.com',
      strategy: 'google',
      username: 'xxx',
    };
    const data2: TCreateUser = {
      email: 'xxx@mail.com',
      strategy: 'default',
      username: 'xxx',
      password: 'xxx',
    };
    it('should return user and verificationCode is empty string', async () => {
      const { user, verificationCode } = await userService.addNewUser(data);
      expect(user).toBeTruthy();
      expect(verificationCode).toBe('');
    });
    it("should create user with null password when strategy is not 'default'", async () => {
      const { user } = await userService.addNewUser(data);
      expect(user).toBeTruthy();
      expect(user.password).toBeNull();
    });
    it('should create user. User password is not null. User isActive is false. User isVerified is false', async () => {
      const { user } = await userService.addNewUser(data2);
      expect(user).toBeTruthy();
      expect(user.password).toBeTruthy();
      expect(user.isActive).toBe(false);
      expect(user.isVerified).toBe(false);
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password', async () => {
      const dummyUser = await userService.getOneUser({ _id: dummyId });
      const afterUpdateDummyUser = await userService.updateUserPassword(
        dummyId,
        'kjhfksdiuf',
      );
      expect(afterUpdateDummyUser).toBeTruthy();
      expect(afterUpdateDummyUser?.password).toBeTruthy();
      expect(dummyUser?.password).toBeTruthy();
      expect(dummyUser?.password).not.toBe(afterUpdateDummyUser?.password);
    });
    it('should update user jwtVersion', async () => {
      const dummyUser = await userService.getOneUser({ _id: dummyId });
      await userService.updateUserPassword(dummyId, 'kjhfksdiuf');
      const afterUpdateDummyUser = await userService.getOneUser({
        _id: dummyId,
      });
      expect(afterUpdateDummyUser).toBeTruthy();
      expect(dummyUser?.jwtVersion).toBeTruthy();
      expect(afterUpdateDummyUser?.jwtVersion).toBeTruthy();
      expect(dummyUser?.jwtVersion).not.toBe(afterUpdateDummyUser?.jwtVersion);
    });
  });

  describe('verifyNewUser', () => {
    it('should update user isActive and isVerified to be true', async () => {
      const dummyUser = await userService.getOneUser({ _id: dummyId });
      const afterUpdateDummyUser = await userService.verifyNewUser(dummyId);
      expect(afterUpdateDummyUser).toBeTruthy();
      expect(dummyUser?.isActive).not.toEqual(afterUpdateDummyUser?.isActive);
      expect(dummyUser?.isVerified).not.toEqual(
        afterUpdateDummyUser?.isVerified,
      );
      expect(afterUpdateDummyUser?.isActive).toBe(true);
      expect(afterUpdateDummyUser?.isVerified).toBe(true);
    });
  });
});
