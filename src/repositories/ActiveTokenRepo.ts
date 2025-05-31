import { ActiveToken, TActiveToken } from '@/models/ActiveTokenModel';

export default class ActiveTokenRepo {
  async create(userId: string, jti: string, deviceId: string) {
    const newActiveToken = new ActiveToken({
      userId,
      jti,
      deviceId,
    });
    return newActiveToken.save();
  }
  async findOne(filter: Partial<TActiveToken>) {
    return ActiveToken.findOne(filter);
  }

  async deleteMany(filter: Partial<TActiveToken>): Promise<void> {
    await ActiveToken.deleteMany({ ...filter });
  }
}
