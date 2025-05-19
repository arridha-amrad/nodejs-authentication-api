import mongoose, { InferSchemaType } from 'mongoose';
import { RefreshToken } from './RefreshTokenModel';

export const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String, // validate required only for 'default' strategy in controller
    },
    strategy: {
      type: String,
      required: true,
      enum: ['default', 'google', 'github'],
    },
    jwtVersion: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// delete all refToken of an user when the user is deleted
UserSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await RefreshToken.deleteMany({ userId: doc._id });
  }
  next();
});

export const User = mongoose.model('User', UserSchema);

export type TUser = InferSchemaType<typeof UserSchema>;
