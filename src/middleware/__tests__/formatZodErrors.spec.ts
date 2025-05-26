import z, { ZodError } from 'zod';
import { formatZodErrors } from '../validator/formatZodErrors';

describe('formatZodErrors', () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  it('should return formatted error messages', () => {
    const result = schema.safeParse({ email: 'invalid', password: '123' });
    expect(result.success).toBe(false);
    // eslint-disable-next-line
    const formatted = formatZodErrors(result.error as ZodError<any>);
    expect(formatted).toEqual({
      email: expect.any(String),
      password: expect.any(String),
    });
  });
});
