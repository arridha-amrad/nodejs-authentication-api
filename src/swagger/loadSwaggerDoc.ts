import { Express } from 'express';

export const loadSwaggerDocs = async (app: Express) => {

  const swaggerUi = await import('swagger-ui-express');
  const swaggerSpec = await import('./index'); // adjust path if needed

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec.default, {
      swaggerOptions: {
        withCredentials: true,
      },
    }),
  );

  console.log('Swagger docs available at http://localhost:5000/api-docs');
};
