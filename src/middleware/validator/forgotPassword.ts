import { formatZodErrors } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const schema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof schema>;

export const validate = (data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { valid: false, errors: formatZodErrors(result.error) };
  }
  return { valid: true, data: result.data };
};

export const validateForgotPasswordInput = async (
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
