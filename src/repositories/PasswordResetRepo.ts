import { PasswordReset, TPasswordReset } from '@/models/PasswordResetModel';

export default class PasswordResetRepository {
  async create(email: string, hashedToken: string) {
    const pt = new PasswordReset({
      email,
      token: hashedToken,
    });
    return pt.save();
  }

  async findOne(filter: Partial<TPasswordReset>) {
    return PasswordReset.findOne(filter);
  }

  async deleteOne(id: string) {
    return PasswordReset.findByIdAndDelete(id);
  }
}
