import { VERIFICATION_CODE_LENGTH } from '@/constants';
import {
  TVerificationCode,
  VerificationCode,
} from '@/models/VerificationCodeModel';
import { generateRandomBytes } from '@/utils';
import { Query } from 'mongoose';

export default class VerificationCodeRepository {
  async create(userId: string) {
    const vc = new VerificationCode({
      userId,
      code: generateRandomBytes(VERIFICATION_CODE_LENGTH),
    });
    return vc.save();
  }
  async findOne(filter: Partial<TVerificationCode>) {
    return VerificationCode.findOne(filter);
  }
  async updateOne(
    filter: Partial<TVerificationCode>,
    data: Partial<TVerificationCode>,
  ) {
    return VerificationCode.findOneAndUpdate(
      {
        ...filter,
      },
      {
        ...data,
      },
    );
  }
  // eslint-disable-next-line
  async deleteMany(userId: string): Promise<Query<any, any>> {
    return VerificationCode.deleteMany({ userId });
  }
}
