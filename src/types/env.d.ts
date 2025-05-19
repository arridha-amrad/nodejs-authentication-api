declare namespace NodeJS {
  interface ProcessEnv {
    DB_URI: string;
    JWT_SECRET: string;
    NODE_ENV: 'test' | 'development' | 'production';
    CLIENT_BASE_URL: string;
    API_VERSION: string;
    PORT: number;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REFRESH_TOKEN: string;
    JWT_SECRET: string;
  }
}
