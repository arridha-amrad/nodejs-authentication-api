import { createMessageResponse, ServerErrorResponse } from '../helpers';

const Request = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      description: 'Email Address',
      example: 'user@example.com',
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
              'An email has been sent to user@example.com. Please follow the instructions to reset your password.',
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
              email: 'Invalid email',
            },
          },
        },
      },
    },
  },
};

export const forgotPasswordRoute = {
  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Forgot Password',
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
        404: createMessageResponse('Not Found', 'User not found'),
        500: ServerErrorResponse,
      },
    },
  },
};
