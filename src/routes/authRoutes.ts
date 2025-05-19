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
router.post('', validateLoginInput, login);
router.post('/signup', validateSignupInput, signup);
router.post('/logout', protectedRoute, logout);
router.post('/forgot-password', validateForgotPasswordInput, forgotPassword);
router.post(
  '/reset-password/:token',
  validateResetPasswordInput,
  resetPassword,
);
router.post(
  '/email-verification',
  validateEmailVerificationInput,
  emailVerification,
);
router.post('/email-verification/resend', requestResendEmailVerificationCode);

router.get('/ping', (_req, res) => {
  res.status(200).send('pong');
});

export default router;
