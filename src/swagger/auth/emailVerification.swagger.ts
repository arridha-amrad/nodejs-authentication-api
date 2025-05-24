import { createMessageResponse, ServerErrorResponse } from '../helpers';

const Request = {
  type: 'object',
  required: ['code'],
  properties: {
    code: {
      type: 'string',
      description: 'Code',
      example: '1x23ml8y',
    },
  },
};

const Successful = {
  description: 'Email Verification is successful',
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
    },
  },
};

const ValidationError = {
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
              code: 'Invalid Code',
            },
          },
        },
      },
    },
  },
};

export const emailVerificationRoute = {
  '/auth/email-verification': {
    post: {
      tags: ['Auth'],
      summary: 'Email Verification',
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
        400: ValidationError,
        401: createMessageResponse(
          'Unauthorized action',
          'Cookie signup is missing',
        ),
        404: createMessageResponse('Not found', 'User not found'),
        500: ServerErrorResponse,
      },
    },
  },
};
