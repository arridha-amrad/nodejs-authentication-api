import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { formatZodErrors } from './formatZodErrors';

export const schema = z.object({
  email: z.string().email('Invalid email'),
});

export type ForgotPasswordInput = z.infer<typeof schema>;

export const validateForgotPasswordInput = async (
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
