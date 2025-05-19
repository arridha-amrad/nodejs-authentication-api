// reset-password.test.ts
import { validate } from '../validator/resetPassword';
import { ResetPasswordInput } from '../validator/resetPassword';

describe('Reset Password Schema Validation', () => {
  describe('Password Field Validation', () => {
    it('should accept a valid password meeting all requirements', () => {
      const validPasswords = [
        'ValidPass1!',
        'Another@2',
        '1MoreValid#',
        'S3cur3P@ss',
      ];

      validPasswords.forEach((password) => {
        const input: ResetPasswordInput = {
          password,
          confirmPassword: password,
        };
        const result = validate(input);
        expect(result).toEqual({
          valid: true,
          data: input,
        });
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = validate({
        password: 'Short1!',
        confirmPassword: 'Short1!',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must be at least 8 characters',
      );
    });

    it('should reject passwords missing lowercase letters', () => {
      const result = validate({
        password: 'UPPERCASE1!',
        confirmPassword: 'UPPERCASE1!',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must contain at least one lowercase letter',
      );
    });

    it('should reject passwords missing uppercase letters', () => {
      const result = validate({
        password: 'lowercase1!',
        confirmPassword: 'lowercase1!',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must contain at least one uppercase letter',
      );
    });

    it('should reject passwords missing numbers', () => {
      const result = validate({
        password: 'NoNumber!',
        confirmPassword: 'NoNumber!',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must contain at least one number',
      );
    });

    it('should reject passwords missing special characters', () => {
      const result = validate({
        password: 'NoSpecial1',
        confirmPassword: 'NoSpecial1',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must contain at least one special character',
      );
    });

    it('should reject empty password', () => {
      const result = validate({
        password: '',
        confirmPassword: '',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must be at least 8 characters',
      );
    });
  });

  describe('Confirm Password Validation', () => {
    it('should reject when passwords do not match', () => {
      const result = validate({
        password: 'ValidPass1!',
        confirmPassword: 'Different1!',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.confirmPassword).toContain(
        'Passwords do not match',
      );
    });

    it('should reject empty confirm password', () => {
      const result = validate({
        password: 'ValidPass1!',
        confirmPassword: '',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.confirmPassword).toContain(
        'Passwords do not match',
      );
    });

    it('should reject when confirm password is missing', () => {
      const result = validate({ password: 'ValidPass1!' } as any);
      expect(result.valid).toBe(false);
      expect(result.errors?.confirmPassword).toContain('Required');
    });
  });

  describe('Complete Form Validation', () => {
    it('should validate complete valid form', () => {
      const input = {
        password: 'SecureP@ss1',
        confirmPassword: 'SecureP@ss1',
      };
      const result = validate(input);
      expect(result).toEqual({
        valid: true,
        data: input,
      });
    });

    it('should return multiple errors when both fields are invalid', () => {
      const result = validate({
        password: 'short',
        confirmPassword: 'different',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toContain(
        'Password must be at least 8 characters',
      );
      expect(result.errors?.confirmPassword).toContain(
        'Passwords do not match',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in passwords', () => {
      const result = validate({
        password: '  ValidPass1!  ',
        confirmPassword: 'ValidPass1!',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.confirmPassword).toContain(
        'Passwords do not match',
      );
    });

    it('should accept passwords with various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
      specialChars.forEach((char) => {
        const password = `Passw0rd${char}`;
        const result = validate({
          password,
          confirmPassword: password,
        });
        expect(result.valid).toBe(true);
      });
    });

    it('should reject passwords with only spaces', () => {
      const result = validate({
        password: '        ',
        confirmPassword: '        ',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.password).toBeTruthy();
    });
  });
});
