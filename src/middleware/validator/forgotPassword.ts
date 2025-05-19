import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const schema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof schema>;

export const validateForgotPasswordInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  const result = schema.safeParse({ email });

  if (!result.success) {
    const formatted = result.error.format();
    const errors: Partial<Record<keyof ForgotPasswordInput, string>> = {};
    for (const key of Object.keys(formatted) as (keyof typeof formatted)[]) {
      if (key !== '_errors' && formatted[key]?._errors?.length) {
        errors[key] = formatted[key]!._errors[0];
      }
    }
    res.status(400).json({ errors });
    return;
  } else {
    const { email } = result.data;
    req.body = {
      email,
    };
    next();
  }
};
