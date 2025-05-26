import { ActiveToken, TActiveToken } from '@/models/ActiveTokenModel';

export default class ActiveTokenRepo {
  async create(userId: string, jti: string) {
    const newActiveToken = new ActiveToken({
      userId,
      jti,
    });
    return newActiveToken.save();
  }

  async findOne(filter: Partial<TActiveToken>) {
    return ActiveToken.findOne(filter);
  }

  async deleteOne(jti: string) {
    return ActiveToken.findOneAndDelete({ jti });
  }
}
