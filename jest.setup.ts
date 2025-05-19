import dotenv from 'dotenv';
import path from 'path';

// Load test-specific environment variables
dotenv.config({
  path: path.resolve(__dirname, '.env.test'),
  override: true, // Override existing variables
});
