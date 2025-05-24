import swaggerJSDoc from 'swagger-jsdoc';
import { getAuthUserRoute } from './auth/getAuthUser.swagger';
import { loginRoute } from './auth/login.swagger';
import { refreshTokenRoute } from './auth/refreshToken.swagger';
import { signupRoute } from './auth/signup.swagger';
import { logoutRoute } from './auth/logout.swagger';
import { emailVerificationRoute } from './auth/emailVerification.swagger';
import { forgotPasswordRoute } from './auth/forgotPassword.swagger';
import { resetPasswordRoute } from './auth/resetPassword.swagger';
import { requestResendEmailVerificationCodeRoute } from './auth/requestResendEmailVerificationCode.swagger';
import { loginWithGithubRoute, loginWithGoogleRoute } from './oauth.swagger';

const paths = Object.assign(
  {},
  signupRoute,
  emailVerificationRoute,
  loginRoute,
  getAuthUserRoute,
  refreshTokenRoute,
  logoutRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  requestResendEmailVerificationCodeRoute,
  loginWithGithubRoute,
  loginWithGoogleRoute,
);

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NodeJs Authentiction API',
      version: '1.0.0',
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
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          example: { message: 'Internal server error' },
        },
      },
    },
    paths,
  },
  apis: ['./src/routes/**/*.ts'], // Adjust to match your routes location
};

export default swaggerJSDoc(swaggerOptions);
