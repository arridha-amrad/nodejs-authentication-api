import { createMessageResponse, ServerErrorResponse } from '../helpers';

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
              'An email has been sent to john_doe@mail.com please follow the instruction to verify your account.',
          },
        },
      },
    },
  },
};

export const requestResendEmailVerificationCodeRoute = {
  '/auth/email-verification/resend': {
    post: {
      tags: ['Auth'],
      summary: 'Resend Email Verification Code',
      responses: {
        200: Successful,
        401: createMessageResponse(
          'Missing cookie',
          'Sign up cookie is missing',
        ),
        403: createMessageResponse(
          'Verification failure',
          'User has been verified',
        ),
        404: createMessageResponse('Not Found', 'User not found'),
        500: ServerErrorResponse,
      },
    },
  },
};
