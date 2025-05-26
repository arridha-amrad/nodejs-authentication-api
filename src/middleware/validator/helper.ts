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

export const messages = {
  identityRequired: 'Identity is required',
  identityInvalid: 'Must be a valid email or username',
  usernameTooShort: 'Username must be at least 3 characters',
  usernameTooLong: 'Username must be at most 30 characters',
  emailInvalid: 'Invalid email',
  pwdTooShort: 'Password must be at least 8 characters',
  pwdMissingLowerCase: 'Password must contain at least one lowercase letter',
  pwdMissingUpperCase: 'Password must contain at least one uppercase letter',
  pwdMissingSpecialCharacter:
    'Password must contain at least one special character',
  pwdMissingNumber: 'Password must contain at least one number',
  pwdLogin: 'Password must be at least 6 characters',
};
