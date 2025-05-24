import { env } from '@/env';
import app from './app';
import { connectToMongoDb } from './database/db.mongo';
import { loadSwaggerDocs } from './swagger/loadSwaggerDoc';

export const runServer = async () => {
  await loadSwaggerDocs(app);
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
