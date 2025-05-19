import { setExpiryDate } from '@/utils';
import mongoose, { InferSchemaType } from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: {
    type: Date,
    default: () => setExpiryDate(7, 'days'),
    index: { expires: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

export type TRefreshToken = InferSchemaType<typeof RefreshTokenSchema>;
