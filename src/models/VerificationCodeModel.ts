import mongoose, { InferSchemaType, Schema } from 'mongoose';

const VerificationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expires: 0 }, // auto-delete after `expiresAt`
    },
  },
  { timestamps: true },
);
export const VerificationCode = mongoose.model(
  'VerificationCode',
  VerificationCodeSchema,
);
export type TTVerificationCode = Omit<
  InferSchemaType<typeof VerificationCodeSchema>,
  'userId'
>;
export type TVerificationCode = TTVerificationCode & { userId: string };
