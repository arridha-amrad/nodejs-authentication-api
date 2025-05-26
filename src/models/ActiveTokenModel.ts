import { setExpiryDate } from '@/utils';
import mongoose, { InferSchemaType } from 'mongoose';

export const ActiveTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jti: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => setExpiryDate(16, 'minutes'),
    index: { expires: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

export const ActiveToken = mongoose.model('ActiveToken', ActiveTokenSchema);
export type TActiveToken = InferSchemaType<typeof ActiveTokenSchema> & {
  _id: unknown;
};
