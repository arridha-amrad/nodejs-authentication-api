import type { TUser } from '@/models/UserModel';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        jti: string;
      };
    }
  }
}
export {};
