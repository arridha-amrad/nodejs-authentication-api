import { createMessageResponse, ServerErrorResponse } from '../helpers';

const Request = {
  type: 'object',
  required: ['password', 'confirmPassword'],
  properties: {
    password: {
      type: 'string',
      description: 'Password',
      format: 'password',
      example: 'P@ssw0rd123',
    },
    confirmPassword: {
      type: 'string',
      description: 'Confirm Password',
      format: 'password',
      example: 'P@ssw0rd123',
    },
  },
};

const Successful = {
  description: 'Request is successful',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example:
              'Congratulations! Your password have changed successfully.',
          },
        },
      },
    },
  },
};

const Validator = {
  description: 'Validation error',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          errors: {
            type: 'object',
            example: {
              password: 'Password must be at least 8 characters',
              confirmPassword: 'Passwords do not match',
            },
          },
        },
      },
    },
  },
};

export const resetPasswordRoute = {
  '/auth/reset-password/{token}': {
    post: {
      tags: ['Auth'],
      summary: 'Reset Password',
      parameters: [
        {
          in: 'path',
          name: 'token',
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGci...', // shortened for brevity
          },
        },
        {
          in: 'query',
          name: 'email',
          required: true,
          schema: {
            type: 'string',
            format: 'email', // 👈 Improved validation
            example: 'john_doe@mail.com',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: Request,
          },
        },
      },
      responses: {
        200: Successful,
        400: Validator,
        403: createMessageResponse('Missing token', 'Token is missing'),
        404: createMessageResponse('Not Found', 'User not found'),
        500: ServerErrorResponse,
      },
    },
  },
};
