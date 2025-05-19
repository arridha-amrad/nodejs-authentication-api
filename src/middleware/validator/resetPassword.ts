import { formatZodErrors } from '@/utils';
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

export const validate = (data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { valid: false, errors: formatZodErrors(result.error) };
  }
  return { valid: true, data: result.data };
};

export const validateResetPasswordInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validation = validate(req.body);
  if (!validation.valid) {
    res.status(400).json({ errors: validation.errors });
    return;
  }
  req.body = validation.data;
  next();
};
