import { validate } from '../login';

describe('validate login input', () => {
  it('should be valid inputs', () => {
    const result = validate({
      identity: 'john_doe',
      password: '123456',
    });
    expect(result.valid).toBe(true);
    expect(result.data).toBeTruthy();
  });
  it('should return validation errors for both identity and password', async () => {
    const result = validate({
      identity: '',
      password: '',
    });
    expect(result.errors).toMatchObject({
      identity: 'Identity is required',
      password: 'Password must be at least 6 characters',
    });
    expect(result.valid).toBe(false);
  });
  it("should return 'Identity is required'", async () => {
    const result = validate({
      identity: '',
      password: 'validPwd123!',
    });
    expect(result.errors).toMatchObject({
      identity: 'Identity is required',
    });
    expect(result.valid).toBe(false);
  });
  it("should return 'Must be a valid email or username'", async () => {
    const result = validate({
      identity: 'test@',
      password: 'validPwd123!',
    });
    expect(result.errors).toMatchObject({
      identity: 'Must be a valid email or username',
    });
    expect(result.valid).toBe(false);
  });
  it("should return 'Password must be at least 6 characters'", async () => {
    const result = validate({
      identity: 'john_doe',
      password: '123!',
    });
    expect(result.errors).toMatchObject({
      password: 'Password must be at least 6 characters',
    });
    expect(result.valid).toBe(false);
  });
});
