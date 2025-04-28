import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UberEats API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'], // files containing annotations
};

export const swaggerSpec = swaggerJSDoc(options); 