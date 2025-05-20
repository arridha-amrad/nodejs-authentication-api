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
app.use((_err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: 'Internal server error' });
  return;
});

export default app;
