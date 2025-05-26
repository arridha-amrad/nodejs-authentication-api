import { RefreshToken, TRefreshToken } from '@/models/RefreshTokenModel';

type TStoredRefToken = Pick<
  TRefreshToken,
  'ip' | 'token' | 'userAgent' | 'userId'
>;

export default class RefreshTokenRepository {
  async create(data: TStoredRefToken) {
    const rt = new RefreshToken(data);
    return rt.save();
  }

  async findOne(filter: Partial<TRefreshToken>) {
    return RefreshToken.findOne(filter);
  }

  async deleteOne(hashedToken: string) {
    return RefreshToken.findOneAndDelete({
      token: hashedToken,
    });
  }
}
