import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

import { z } from 'zod';
import { formatZodErrors, messages } from './helper';

const schema = z.object({
  username: z
    .string()
    .min(3, messages.usernameTooShort)
    .max(30, messages.usernameTooLong)
    .transform((val) =>
      sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
    ),
  email: z.string().email(messages.emailInvalid),
  password: z
    .string()
    .min(8, messages.pwdTooShort)
    .regex(/[a-z]/, messages.pwdMissingLowerCase)
    .regex(/[A-Z]/, messages.pwdMissingUpperCase)
    .regex(/[0-9]/, messages.pwdMissingNumber)
    .regex(/[^a-zA-Z0-9]/, messages.pwdMissingSpecialCharacter),
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
