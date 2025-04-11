import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { createServer, proxy } from 'aws-serverless-express';

const expressApp = express();

async function createNestApp(expressInstance: express.Express) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: ['http://localhost:3000', configService.get('auth.urlWeb')],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  await AppDataSource.initialize()
    .then(() => logger.log('Database connected'))
    .catch((err) =>
      logger.error(`Database connection error: ${err.message}`, err.stack),
    );
  return expressInstance;
}

let server: any;

export default async function handler(req: any, res: any) {
  if (!server) {
    const expressInstance = await createNestApp(expressApp);
    server = createServer(expressInstance);
  }
  return proxy(server, req, res);
}
