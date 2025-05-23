export const loginResponse = {
  LoginSuccessful: {
    description: 'Refresh token is successful',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/TokenResponse',
        },
        example: { accessToken: 'jwt_token_here' },
      },
    },
  },
  LoginValidationError: {
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
  },
  LoginAccountNotFound: {
    description: 'No account registered with that email or username',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/MessageResponse' },
        example: { message: 'Account not found' },
      },
    },
  },
  LoginAccountNotVerified: {
    description: 'The owner of this account does not verify its account yet',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/MessageResponse' },
        example: { message: 'Account is not verified' },
      },
    },
  },
  LoginInvalidPassword: {
    description: 'The user entered wrong password',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/MessageResponse' },
        example: { message: 'Invalid credentials' },
      },
    },
  },
};
