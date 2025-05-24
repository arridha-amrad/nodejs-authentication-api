const GetAuthUserSuccessful = {
  description: 'Get auth user is successful',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/User',
      },
      examples: {
        default: {
          value: {
            _id: '68307878494dbf19c2b8be96',
            email: 'user@mail.com',
            username: 'john_doe',
          },
        },
      },
    },
  },
};

export const getAuthUserRoute = {
  '/auth': {
    get: {
      tags: ['Auth'],
      summary: 'Get authenticated user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: GetAuthUserSuccessful,
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
};
