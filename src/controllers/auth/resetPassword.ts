import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import { NextFunction, Request, Response } from 'express';

export default async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userService = new UserService();
    const authService = new AuthService();

    const { password } = req.body;

    const token = req.params.token;
    if (!token) {
      res.status(403).json({ message: 'Token is missing' });
      return;
    }

    const emailFromQuery = req.query.email;
    if (!emailFromQuery || typeof emailFromQuery !== 'string') {
      res.status(400).json({ message: 'Email is missing' });
      return;
    }

    const email = decodeURIComponent(emailFromQuery);

    const storedPwdResetData = await authService.getPasswordResetData(
      token,
      email,
    );
    if (!storedPwdResetData) {
      res.status(404).json({ message: 'No record in pwd reset table' });
      return;
    }

    const account = await userService.getOneUser({ email });
    if (!account) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await authService.resetUserPassword(
      account.id,
      password,
      storedPwdResetData.id,
    );

    res.status(200).json({
      message: 'Congratulations! Your password have changed successfully.',
    });
    return;
  } catch (err) {
    next(err);
  }
}
