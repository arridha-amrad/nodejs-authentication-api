import UserService from '@/services/UserService';
import { Request, Response } from 'express';

export default async function getAuthUser(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'UnAuthorized' });
    return;
  }
  const userService = new UserService();
  const user = await userService.getOneUser({ _id: userId });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.status(200).json({ user: userService.setUserResponse(user) });
  return;
}
