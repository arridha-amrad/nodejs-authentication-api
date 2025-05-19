import { validate } from '../validator/emailVerification';

describe('validate email verification input', () => {
  it("should return validation errors 'Invalid code'", () => {
    const result = validate({
      code: '',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      code: 'Invalid code',
    });
  });
  it('should be valid input', () => {
    const result = validate({
      code: '12345678',
    });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      code: '12345678',
    });
  });
});
