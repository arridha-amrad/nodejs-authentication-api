import { RefreshToken, TRefreshToken } from '@/models/RefreshTokenModel';
import { setExpiryDate } from '@/utils';

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

  async updateOne(id: string, newToken: string) {
    return RefreshToken.findByIdAndUpdate(id, {
      token: newToken,
      createdAt: new Date(),
      expiresAt: setExpiryDate(7, 'days'),
    });
  }

  async deleteOne(hashedToken: string) {
    return RefreshToken.findOneAndDelete({
      token: hashedToken,
    });
  }
}
