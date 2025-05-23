import emailVerification from '@/controllers/auth/emailVerification';
import forgotPassword from '@/controllers/auth/forgotPassword';
import login from '@/controllers/auth/login';
import logout from '@/controllers/auth/logout';
import getAuthUser from '@/controllers/auth/getAuthUser';
import refreshToken from '@/controllers/auth/refreshToken';
import requestResendEmailVerificationCode from '@/controllers/auth/requestResendEmailVerificationCode';
import resetPassword from '@/controllers/auth/resetPassword';
import signup from '@/controllers/auth/signup';
import { protectedRoute } from '@/middleware/protectedRoute';
import { validateEmailVerificationInput } from '@/middleware/validator/emailVerification';
import { validateForgotPasswordInput } from '@/middleware/validator/forgotPassword';
import { validateLoginInput } from '@/middleware/validator/login';
import { validateResetPasswordInput } from '@/middleware/validator/resetPassword';
import { validateSignupInput } from '@/middleware/validator/signup';
import Express from 'express';

const router = Express.Router();

router.get('', protectedRoute, getAuthUser);
router.get('/refresh-token', refreshToken);

/**
 * @swagger
 * /auth:
 *   post:
 *     tags: [Auth]
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identity, password]
 *             properties:
 *               identity:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *          $ref: '#/components/responses/LoginSuccessful'
 *       400:
 *          $ref: '#/components/responses/LoginValidationError'
 *       401:
 *          $ref: '#/components/responses/LoginInvalidPassword'
 *       403:
 *          $ref: '#/components/responses/LoginAccountNotVerified'
 *       404:
 *          $ref: '#/components/responses/LoginAccountNotFound'
 *       500:
 *          $ref: '#/components/responses/ServerError'
 */
router.post('', validateLoginInput, login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/signup', validateSignupInput, signup);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', protectedRoute, logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */
router.post('/forgot-password', validateForgotPasswordInput, forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post(
  '/reset-password/:token',
  validateResetPasswordInput,
  resetPassword,
);

/**
 * @swagger
 * /auth/email-verification:
 *   post:
 *     summary: Verify user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
router.post(
  '/email-verification',
  validateEmailVerificationInput,
  emailVerification,
);

/**
 * @swagger
 * /auth/email-verification/resend:
 *   post:
 *     summary: Resend email verification code
 *     responses:
 *       200:
 *         description: Verification code resent
 */
router.post('/email-verification/resend', requestResendEmailVerificationCode);

/**
 * @swagger
 * /auth/ping:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is up
 */
router.get('/ping', (_req, res) => {
  res.status(200).send('pong');
});

export default router;
