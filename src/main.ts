import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

const expressApp = express();

async function createNestApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
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
  return expressApp;
}

let server: any;

export default async function handler(event: any, context: any) {
  if (!server) {
    const app = await createNestApp();
    server = serverlessExpress({ app });
  }
  return server(event, context);
}
