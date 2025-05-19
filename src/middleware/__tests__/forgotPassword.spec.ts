// forgot-password.test.ts
import { validate } from '../validator/forgotPassword';

describe('Forgot Password Schema Validation', () => {
  describe('Email Validation', () => {
    it('should accept a valid email', () => {
      const validInput = { email: 'user@example.com' };
      const result = validate(validInput);

      expect(result).toEqual({
        valid: true,
        data: { email: 'user@example.com' },
      });
    });

    it('should reject an empty string', () => {
      const invalidInput = { email: '' };
      const result = validate(invalidInput);

      expect(result.valid).toBe(false);
      expect(result?.errors).toHaveProperty('email');
      expect(result?.errors?.email).toContain('Invalid email');
    });

    it('should reject missing email field', () => {
      const invalidInput = {};
      const result = validate(invalidInput);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors?.email).toContain('Required');
    });

    it('should reject non-string values', () => {
      const invalidInputs = [
        { email: 123 },
        { email: true },
        { email: { object: 'value' } },
        { email: null },
      ];

      invalidInputs.forEach((input) => {
        const result = validate(input);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveProperty('email');
        expect(result.errors?.email).toContain('Expected string');
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plainstring',
        'missing@domain',
        'user@.com',
        '@example.com',
        'user@example..com',
        'user@example.c',
        'user@example,com',
      ];

      invalidEmails.forEach((email) => {
        const result = validate({ email });
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveProperty('email');
        expect(result.errors?.email).toContain('Invalid email');
      });
    });
  });

  describe('Validation Function', () => {
    it('should return valid: true with data when validation succeeds', () => {
      const validInput = { email: 'test@example.com' };
      const result = validate(validInput);

      expect(result).toEqual({
        valid: true,
        data: validInput,
      });
    });

    it('should return valid: false with errors when validation fails', () => {
      const invalidInput = { email: 'invalid' };
      const result = validate(invalidInput);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it('should handle completely invalid input structures', () => {
      const invalidInputs = [null, undefined, 42, 'string', [], () => {}];

      invalidInputs.forEach((input) => {
        const result = validate(input);
        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });
  });
});
