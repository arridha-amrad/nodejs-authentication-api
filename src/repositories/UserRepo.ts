import { TUser, User } from '@/models/UserModel';

export default class UserRepository {
  async create(data: Partial<TUser>) {
    const newUser = new User(data);
    return newUser.save();
  }
  async findOne(filter: Partial<TUser & { _id: string }>) {
    return User.findOne(filter);
  }
  async updateOne(id: string, update: Partial<TUser>) {
    return User.findByIdAndUpdate(id, { ...update }, { new: true });
  }
}
