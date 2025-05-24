import { ServerErrorResponse, UnAuthorizedByProtectedRoute } from '../helpers';

const LogoutSuccessful = {
  description: 'Logout is successful',
  content: {
    'application/json': {
      schema: {
        type: 'string',
        example: 'Logout',
      },
    },
  },
};

export const logoutRoute = {
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      summary: 'Logout',
      responses: {
        200: LogoutSuccessful,
        401: UnAuthorizedByProtectedRoute,
        500: ServerErrorResponse,
      },
    },
  },
};
