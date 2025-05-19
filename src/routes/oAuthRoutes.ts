import {
  loginWithGithub,
  githubOauthCallback,
} from '@/controllers/oAuth/githubOauth2';
import {
  loginWithGoogle,
  googleOAuth2Callback,
} from '@/controllers/oAuth/googleOauth2';
import Express from 'express';

const router = Express.Router();

router.get('/google', loginWithGoogle);
router.get('/google/callback', googleOAuth2Callback);
router.get('/github', loginWithGithub);
router.get('/github/callback', githubOauthCallback);

export default router;
