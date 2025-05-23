export const getAuthUserRoute = {
  '/auth': {
    get: {
      tags: ['Auth'],
      summary: 'Get authenticated user',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          $ref: '#/components/responses/GetAuthUserSuccessful',
        },
        401: {
          $ref: '#/components/responses/UnAuthorizedByProtectedRoute',
        },
      },
    },
  },
};

export const getAuthUserResponse = {
  GetAuthUserSuccessful: {
    description: 'Get auth user is successful',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/User',
        },
        example: {
          _id: '68307878494dbf19c2b8be96',
          email: 'user@mail.com',
          username: 'john_doe',
        },
      },
    },
  },
};
