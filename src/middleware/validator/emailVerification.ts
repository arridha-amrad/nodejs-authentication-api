import { VERIFICATION_CODE_LENGTH } from '@/constants';
import { getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { formatZodErrors } from './formatZodErrors';

const schema = z.object({
  code: z.string().length(VERIFICATION_CODE_LENGTH, 'Invalid code'),
});

export type VerificationInput = z.infer<typeof schema>;

export const validateEmailVerificationInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { value: userId } = getCookie(req, 'signup');
  if (!userId) {
    res.status(401).json({ message: 'Cookie signup is missing' });
    return;
  }
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: formatZodErrors(result.error) });
    return;
  }
  req.body = {
    userId,
    code: result.data?.code,
  };
  next();
};
