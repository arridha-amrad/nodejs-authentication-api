import swaggerJSDoc from 'swagger-jsdoc';
import { loginResponse } from './auth/login.swagger';
import { refreshTokenRoute } from './auth/refreshToken.swagger';
import {
  getAuthUserResponse,
  getAuthUserRoute,
} from './auth/getAuthUser.swagger';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'API documentation with Swagger and TypeScript',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '123abc' },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'john_doe' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'jwt_token_here' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          example: { message: 'Internal server error' },
        },
        ValidationError: {
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
      responses: {
        ServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MessageResponse',
              },
            },
          },
        },
        ...loginResponse,
        ...getAuthUserResponse,
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        Unauthorized: {
          description: 'UnAuthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
              example: { message: 'UnAuthorized' },
            },
          },
        },
        Forbidden: {
          description: 'Account not verified',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
              example: { message: 'Account is not verified' },
            },
          },
        },
        UnAuthorizedByProtectedRoute: {
          description: `Wrong format of bearer token or 
            No accessToken in request headers or 
            Invalid token payload or 
            Token expired.`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
              example: { message: 'Missing or invalid token' },
            },
          },
        },
        UserNotFound: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
              example: { message: 'User not found' },
            },
          },
        },
      },
    },
    paths: {
      ...getAuthUserRoute,
      ...refreshTokenRoute,
    },
  },
  apis: ['./src/routes/**/*.ts'], // Adjust to match your routes location
};

export default swaggerJSDoc(swaggerOptions);
