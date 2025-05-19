import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';

dotenv.config({
  path: path.resolve(envFile),
});

export const env = {
  DB_URI: process.env.DB_URI!,

  CLIENT_BASE_URL: process.env.CLIENT_BASE_URL!,
  BASE_URL: process.env.BASE_URL!,
  API_VERSION: process.env.API_VERSION!,
  PORT: process.env.PORT!,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN!,
  GOOGLE_USER: process.env.GOOGLE_USER!,

  JWT_SECRET: process.env.JWT_SECRET!,
};
