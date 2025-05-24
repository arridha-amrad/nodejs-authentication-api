import { createMessageResponse, ServerErrorResponse } from '../helpers';

const SignupRequest = {
  type: 'object',
  required: ['identity', 'password'],
  properties: {
    username: {
      type: 'string',
      description: 'username',
      example: 'john_doe',
    },
    email: {
      type: 'string',
      description: 'Email Address',
      example: 'john_doe@mail.com',
    },
    password: {
      type: 'string',
      description: 'Password',
      format: 'password',
      example: 'P@ssw0rd123',
    },
  },
};

const SignupSuccessful = {
  description: 'Signup is successful',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example:
              'An email has been sent to john_doe@mail.com, please follow the instruction to verify your account.',
          },
        },
      },
    },
  },
};

const SignupValidationError = {
  description: 'Validation error',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          errors: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: {
              username: 'Username is required',
              email: 'Email is required',
              password: 'Password must be at least 6 characters',
            },
          },
        },
      },
    },
  },
};

export const signupRoute = {
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Signup',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: SignupRequest,
          },
        },
      },
      responses: {
        201: SignupSuccessful,
        400: SignupValidationError,
        403: createMessageResponse('Unique Constraint', 'Email has been taken'),
        500: ServerErrorResponse,
      },
    },
  },
};
