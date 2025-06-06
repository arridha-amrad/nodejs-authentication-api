import { setExpiryDate } from '@/utils';
import mongoose, { InferSchemaType } from 'mongoose';

export const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true },
  expiresAt: {
    type: Date,
    default: () => setExpiryDate(7, 'days'),
    index: { expires: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});
export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
export type TRefreshToken = InferSchemaType<typeof RefreshTokenSchema> & {
  _id: unknown;
};
