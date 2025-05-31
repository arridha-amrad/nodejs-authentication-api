import { mockEmailService, mockUserService } from '@/__mocks__/services.mock';
import app from '@/app';
import request from 'supertest';

jest.mock('@/services/EmailService', () => ({
  __esModule: true,
  default: jest.fn(() => mockEmailService),
}));

jest.mock('@/services/UserService', () => ({
  __esModule: true,
  default: jest.fn(() => mockUserService),
}));

describe('POST /api/v1/auth/signup', () => {
  it('should catch errors passed to next(err)', async () => {
    mockUserService.checkEmailAndUsernameUniqueness.mockRejectedValue(
      new Error('failure when check email and username uniqueness'),
    );
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'valid@mail.com',
      password: 'validPwd12!',
      username: 'valid_username',
    });
    expect(response.status).toBe(500);
  });

  it('should give response of email validation errors', async () => {
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'invalid email',
      password: 'validPwd12!',
      username: 'valid_username',
    });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      errors: {
        email: expect.any(String),
      },
    });
  });

  it('should give response of username validation errors. too short', async () => {
    const response = await request(app).post('/api/v1/auth/signup').send({
      username: 'xx',
      email: 'valid@Email.com',
      password: 'validPwd12!',
    });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      errors: {
        username: expect.any(String),
      },
    });
  });

  it('should give response of password validation errors', async () => {
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'valid@Email.com',
      password: 'invalidPwd',
      username: 'valid_username',
    });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      errors: {
        password: expect.any(String),
      },
    });
  });

  it('should give response of username has been taken', async () => {
    mockUserService.checkEmailAndUsernameUniqueness.mockResolvedValue({
      constraint: 'username',
    });
    mockUserService.addNewUser.mockResolvedValue(true as any);
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'valid@Email.com',
      password: 'validPwd12!',
      username: 'valid_username',
    });
    expect(mockUserService.addNewUser).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      message: 'username has been taken',
    });
  });

  it('should give response of email has been taken', async () => {
    mockUserService.checkEmailAndUsernameUniqueness.mockResolvedValue({
      constraint: 'email',
    });
    mockUserService.addNewUser.mockResolvedValue(true as any);
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'valid@Email.com',
      password: 'validPwd12!',
      username: 'valid_username',
    });
    expect(mockUserService.addNewUser).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      message: 'email has been taken',
    });
  });

  it('should create a new user', async () => {
    mockEmailService.send.mockResolvedValue();
    mockUserService.checkEmailAndUsernameUniqueness.mockResolvedValue(
      undefined,
    );
    mockUserService.addNewUser.mockResolvedValue({
      verificationCode: 'code',
      user: {
        id: 'userId',
      },
    } as any);
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'xxx@xcxvxmail.com',
      password: 'gloryManUnited99!',
      username: 'xxxxxx',
    });
    expect(mockEmailService.send).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: expect.any(String),
    });
  });
});

