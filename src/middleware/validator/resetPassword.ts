import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { formatZodErrors } from './helper';

export const messages = {
  pwdTooShort: 'Password must be at least 8 characters',
  pwdMissingLowercase: 'Password must contain at least one lowercase letter',
  pwdMissingUppercase: 'Password must contain at least one uppercase letter',
  pwdMissingNumber: 'Password must contain at least one number',
  pwdMissingSpecialCharacter:
    'Password must contain at least one special character',
  pwdPasswordNotMatch: 'Passwords do not match',
};

export const schema = z
  .object({
    password: z
      .string()
      .min(8, messages.pwdTooShort)
      .regex(/[a-z]/, messages.pwdMissingLowercase)
      .regex(/[A-Z]/, messages.pwdMissingUppercase)
      .regex(/[0-9]/, messages.pwdMissingNumber)
      .regex(/[^a-zA-Z0-9]/, messages.pwdMissingSpecialCharacter),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: messages.pwdPasswordNotMatch,
  });

export type ResetPasswordInput = z.infer<typeof schema>;

export const validateResetPasswordInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: formatZodErrors(result.error) });
    return;
  }
  req.body = result.data;
  next();
};
