import { COOKIE_OPTIONS, COOKIE_SIGNUP } from '@/constants';
import { SignupInput } from '@/middleware/validator/signup';
import EmailService from '@/services/EmailService';
import UserService from '@/services/UserService';
import { NextFunction, Request, Response } from 'express';

export default async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, password, username } = req.body as SignupInput;

  try {
    const userService = new UserService();
    const emailService = new EmailService();
    const result = await userService.checkEmailAndUsernameUniqueness(
      email,
      username,
    );
    if (typeof result !== 'undefined') {
      const { constraint } = result;
      res.status(403).json({ message: `${constraint} has been taken` });
      return;
    }
    const {
      verificationCode,
      user: { id: userId },
    } = await userService.addNewUser({
      email,
      username,
      password,
      strategy: 'default',
    });
    await emailService.send({
      to: email,
      subject: 'New account verification',
      html: `
      <p>Hello ${username}</p>
      <p>Verification Code: ${verificationCode}</p> 
      <p>If you did not ask to confirm your email, you can ignore this email.
      </p> <p>Thanks</p>
      `,
    });
    res.cookie(COOKIE_SIGNUP, userId, COOKIE_OPTIONS);
    res.status(201).json({
      message: `An email has been sent to ${email}, please follow the instruction to verify your account.`,
    });
    return;
  } catch (err) {
    next(err);
  }
}
