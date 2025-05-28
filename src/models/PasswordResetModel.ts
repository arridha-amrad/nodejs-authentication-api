import { setExpiryDate } from '@/utils';
import mongoose, { InferSchemaType } from 'mongoose';

export const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => setExpiryDate(1, 'hours'),
    index: { expires: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});
export const PasswordReset = mongoose.model(
  'PasswordReset',
  PasswordResetSchema,
);
export type TPasswordReset = InferSchemaType<typeof PasswordResetSchema> & {
  _id: unknown;
};
