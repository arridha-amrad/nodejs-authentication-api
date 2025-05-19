import { formatZodErrors } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

import { z } from 'zod';

const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .transform((val) =>
      sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
    ),
  email: z.string().email('Invalid email address'),
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

export type SignupInput = z.infer<typeof signupSchema>;

// Extracted validation logic for better testability
export const validate = (data: unknown) => {
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    return { valid: false, errors: formatZodErrors(result.error) };
  }

  return { valid: true, data: result.data };
};

export const validateSignupInput = async (
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
