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

export const createErrorResponse = (
  code: number,
  message: string,
  description?: string,
) => ({
  [code]: createMessageResponse(`${description ?? message}`, message),
});
