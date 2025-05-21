import { env } from '@/env';
import app from './app';
import { connectToMongoDb } from './database/db.mongo';

export const runServer = () => {
  app.listen(env.PORT, () => {
    console.log('Server is running');
  });
};

connectToMongoDb(env.DB_URI)
  .then(() => {
    runServer();
  })
  .catch((err) => {
    console.log(err);
  });
