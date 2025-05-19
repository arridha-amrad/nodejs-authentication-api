import { formatZodErrors } from '@/utils';
import { NextFunction, Request, Response } from 'express';

import { z } from 'zod';

export const schema = z.object({
  identity: z
    .string()
    .min(1, 'Identity is required')
    .refine(
      (val) => /\S+@\S+\.\S+/.test(val) || /^[a-zA-Z0-9._]{3,}$/.test(val),
      {
        message: 'Must be a valid email or username',
      },
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof schema>;

export const validate = (data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { valid: false, errors: formatZodErrors(result.error) };
  }
  return { valid: true, data: result.data };
};

export const validateLoginInput = (
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
