import dotenv from 'dotenv'
dotenv.config();

export const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication Redis',
      version: '1.0.0',
      description: 'API for tracking Auth Redis',
    },
    servers: [
      {
        url: process.env.SWAGGER_BACKEND_URL,
        description: 'Local or public URL for Swagger',
      },
    ],
  },
  apis: ['./routes/*.ts'], 
};