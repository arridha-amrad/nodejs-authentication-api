import { createMessageResponse, ServerErrorResponse } from '../helpers';

const params = [
  {
    in: 'path',
    name: 'token',
    required: true,
    schema: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY4MzA3ODc4NDk0ZGJmMTljMmI4YmU5NiIsImp3dFZlcnNpb24iOiJ5VjlDUiIsImlhdCI6MTc0ODAyNTA0MCwiZXhwIjoxNzQ4MDI1OTQwfQ.sNdJTipWmclxiw7bmogAdDiNY7X7BDM933G39zq1AZ8',
    },
    description: 'Token you get from email',
  },
  {
    in: 'query',
    name: 'email',
    required: true,
    schema: {
      type: 'string',
      example: 'john_doe@mail.com',
    },
    description: 'Email address',
  },
];

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
