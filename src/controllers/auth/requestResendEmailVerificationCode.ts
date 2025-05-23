import AuthService from '@/services/AuthService';
import EmailService from '@/services/EmailService';
import UserService from '@/services/UserService';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export default async function requestResendEmailVerificationCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userService = new UserService();
    const emailService = new EmailService();
    const authService = new AuthService();
    const { value } = getCookie(req, 'signup');
    if (!value) {
      res.status(400).json({ message: 'Sign up cookie is missing' });
      return;
    }
    const account = await userService.getOneUser({ _id: value });
    if (!account) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (account.isVerified) {
      res.status(403).json({ message: 'User has been verified' });
      return;
    }
    const { code } = await authService.regenerateVerificationCode(account.id);
    await emailService.send({
      to: account.email,
      subject: 'New account verification',
      html: `
      <p>Hello ${account.username}</p>
      <p>Verification Code: ${code}</p> 
      <p>If you did not ask to confirm your email, you can ignore this email.
      </p> <p>Thanks</p>
      `,
    });
    res.status(201).json({
      message: `An email has been sent to ${account.email}, please follow the instruction to verify your account.`,
    });
    return;
  } catch (err) {
    next(err);
  }
}
