import AuthService from '@/services/AuthService';
import EmailService from '@/services/EmailService';
import UserService from '@/services/UserService';
import { NextFunction, Request, Response } from 'express';

export default async function forgotPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userService = new UserService();
    const emailService = new EmailService();
    const authService = new AuthService();

    const { email } = req.body;

    const account = await userService.getOneUser({ email });
    if (!account || (account && !account.isVerified)) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const link = await authService.generateLinkToken(email);

    await emailService.send({
      to: email,
      subject: 'Reset Password Request',
      html: `
      <p>Hello <strong>${account.username}</strong>,</p>
      <p>We received a request to reset the password associated with your account.</p>
      <p>If you made this request, you can reset your password by clicking the link below:</p>
      <p><a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></p>
      <p>This link will expire after a certain period for your security.</p>
      <p>If you did not request a password reset, please ignore this email. Your account will remain secure.</p>
      <p>Thanks</p>

      `,
    });

    res.status(200).json({
      message: `An email has been sent to ${email}. Please follow the instructions to reset your password.`,
    });

    return;
  } catch (err) {
    next(err);
  }
}
