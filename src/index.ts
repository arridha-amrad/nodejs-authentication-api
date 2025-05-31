import { env } from '@/env';
import app from './app';
import { connectToMongoDb } from './database/db.mongo';
import { loadSwaggerDocs } from './swagger/loadSwaggerDoc';

export const runServer = async () => {
  if (process.env.NODE_ENV === 'development') {
    await loadSwaggerDocs(app);
  };
  app.listen(env.PORT, () => {
    console.log('Server is running');
  });
};

connectToMongoDb(env.DB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    runServer();
  })
  .catch((err) => {
    console.log(err);
  });
