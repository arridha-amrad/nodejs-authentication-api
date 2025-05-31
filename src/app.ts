import { env } from '@/env';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import oAuthRoutes from './routes/oAuthRoutes';

const app = express();

function isValidHttpUrl(url: string) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (env.CLIENT_BASE_URL && isValidHttpUrl(env.CLIENT_BASE_URL)) {
      const allowedOrigins = [env.CLIENT_BASE_URL];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.use(`/api/v1/auth`, authRoutes);
app.use(`/api/v1/oauth`, oAuthRoutes);

// eslint-disable-next-line
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  // Handle CORS errors specifically
  if (err.message.includes('CORS')) {
    res.status(403).json({ message: err.message });
    return
  }
  // res.status(500).json({ message: 'Internal server error' });
  res.status(500).send(err)
  return;
});

export default app;
