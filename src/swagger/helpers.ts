export const createMessageResponse = (
  description: string,
  message: string,
) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/MessageResponse' },
      example: { message },
    },
  },
});

export const ServerErrorResponse = createMessageResponse(
  'Server Error',
  'Internal server error',
);

export const UnAuthorizedByProtectedRoute = createMessageResponse(
  'Wrong format of bearer token or No accessToken in request headers or Invalid token payload or Token expired.',
  'Token expired',
);
