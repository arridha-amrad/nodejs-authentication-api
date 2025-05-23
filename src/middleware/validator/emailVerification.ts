import { VERIFICATION_CODE_LENGTH } from '@/constants';
import { formatZodErrors, getCookie } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const schema = z.object({
  code: z.string().length(VERIFICATION_CODE_LENGTH, 'Invalid code'),
});

export type VerificationInput = z.infer<typeof schema>;

export const validate = (data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { valid: false, errors: formatZodErrors(result.error) };
  }
  return { valid: true, data: result.data };
};

export const validateEmailVerificationInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { value: userId } = getCookie(req, 'signup');
  console.log(userId);

  if (!userId) {
    res.status(400).json({ message: 'Cookie signup is missing' });
    return;
  }
  const validation = validate(req.body);
  if (!validation.valid) {
    res.status(400).json({ errors: validation.errors });
    return;
  }
  req.body = {
    userId,
    code: validation.data?.code,
  };
  next();
};
