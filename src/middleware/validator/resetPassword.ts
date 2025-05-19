import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ResetPasswordInput = z.infer<typeof schema>;

export const validateResetPasswordInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password, confirmPassword } = req.body;

  const result = schema.safeParse({ password, confirmPassword });

  if (!result.success) {
    const formatted = result.error.format();
    const errors: Partial<Record<keyof ResetPasswordInput, string>> = {};
    for (const key of Object.keys(formatted) as (keyof typeof formatted)[]) {
      if (key !== '_errors' && formatted[key]?._errors?.length) {
        errors[key] = formatted[key]!._errors[0];
      }
    }
    res.status(400).json({ errors });
    return;
  } else {
    const { password } = result.data;
    req.body = {
      password,
    };
    next();
  }
};
