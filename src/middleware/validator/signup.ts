import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

import { z } from 'zod';
import { formatZodErrors } from './formatZodErrors';

const schema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .transform((val) =>
      sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
    ),
  email: z.string().email('Invalid email'),
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
});

export type SignupInput = z.infer<typeof schema>;

export const validateSignupInput = async (
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
