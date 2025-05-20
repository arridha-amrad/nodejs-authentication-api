import { TUser } from '@/models/UserModel';
import { Request, Response } from 'express';

export default async function getAuthUser(req: Request, res: Response) {
  const user = req.user as TUser;
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.status(200).json({ user });
  return;
}
