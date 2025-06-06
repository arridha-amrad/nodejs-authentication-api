import { createMessageResponse, ServerErrorResponse } from '../helpers';

const LoginRequest = {
  type: 'object',
  required: ['identity', 'password'],
  properties: {
    identity: {
      type: 'string',
      description: 'Email or username',
      example: 'user@example.com',
    },
    password: {
      type: 'string',
      description: 'User password',
      format: 'password',
      example: 'P@ssw0rd123',
    },
  },
};

const LoginSuccessful = {
  description: 'Refresh token is successful',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example:
              'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY4MzA3ODc4NDk0ZGJmMTljMmI4YmU5NiIsImp3dFZlcnNpb24iOiJ5VjlDUiIsImlhdCI6MTc0ODAyNTA0MCwiZXhwIjoxNzQ4MDI1OTQwfQ.sNdJTipWmclxiw7bmogAdDiNY7X7BDM933G39zq1AZ8',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      example: { accessToken: 'jwt_token_here' },
    },
  },
};

const LoginValidationError = {
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
              identity: 'Identity is required',
              password: 'Password must be at least 6 characters',
            },
          },
        },
      },
    },
  },
};

export const loginRoute = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LoginRequest,
          },
        },
      },
      responses: {
        200: LoginSuccessful,
        400: LoginValidationError,
        401: createMessageResponse(
          'The user entered wrong password',
          'Invalid credentials',
        ),
        403: createMessageResponse(
          'The owner of this account does not verify its account yet',
          'Account is not verified',
        ),
        404: createMessageResponse(
          'No account registered with that email or username',
          'Account not found',
        ),
        500: ServerErrorResponse,
      },
    },
  },
};
