import { TUser } from '@/models/UserModel';
import { NextFunction, Request, Response } from 'express';

export default async function getAuthUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user as TUser;
    res.status(200).json({ user });
    return;
  } catch (err) {
    next(err);
  }
}
