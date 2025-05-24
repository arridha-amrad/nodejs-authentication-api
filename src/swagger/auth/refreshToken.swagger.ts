import { createMessageResponse, ServerErrorResponse } from '../helpers';

const RefreshTokenSuccessful = {
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
        },
      },
    },
  },
};

export const refreshTokenRoute = {
  '/auth/refresh-token': {
    get: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      responses: {
        200: RefreshTokenSuccessful,
        401: createMessageResponse(
          'Refresh token is missing',
          'Token is missing',
        ),
        404: createMessageResponse(
          'User not found or Token not found',
          'User not found',
        ),
        500: ServerErrorResponse,
      },
    },
  },
};
