import { env } from '@/env';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import oAuthRoutes from './routes/oAuthRoutes';

const app = express();

app.use(
  cors({
    credentials: true,
    origin: env.CLIENT_BASE_URL,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/oAuth`, oAuthRoutes);

// eslint-disable-next-line
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    console.log(err);
    const error = new Error('Internal Server Error');
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } else {
    console.log(err);
    res.status(500).send('Internal error');
  }
  return;
});

export default app;
