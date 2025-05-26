import { ZodSchema, ZodError, z } from 'zod';

export function formatZodErrors<T extends ZodSchema>(
  error: ZodError<z.infer<T>>,
): Partial<Record<keyof z.infer<T>, string>> {
  const formatted = error.format();
  const errors: Partial<Record<keyof z.infer<T>, string>> = {};
  for (const key of Object.keys(formatted) as Array<keyof typeof formatted>) {
    if (key === '_errors') continue;
    // eslint-disable-next-line
    const fieldErrors = (formatted[key] as any)?._errors;
    if (fieldErrors?.length) {
      errors[key as keyof z.infer<T>] = fieldErrors[0];
    }
  }
  return errors;
}
