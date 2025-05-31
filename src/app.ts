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

app.use(`/api/v1/auth`, authRoutes);
app.use(`/api/v1/oauth`, oAuthRoutes);

// eslint-disable-next-line
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  // res.status(500).json({ message: 'Internal server error' });
  res.status(500).send(err)
  return;
});

export default app;
