import { TUser } from '@/models/UserModel';
import UserService from '@/services/UserService';
import { Request, Response } from 'express';

export default async function getAuthUser(req: Request, res: Response) {
  const user = req.user as TUser;
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const userService = new UserService();
  res.status(200).json({ user: userService.setUserResponse(user) });
  return;
}
