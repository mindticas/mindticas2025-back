import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  AppDataSource.initialize()
    .then(() => logger.log('Database connected'))
    .catch((err) =>
      logger.error(`Database connection error: ${err.message}`, err.stack),
    );
  await app.listen(3000);
}

bootstrap();
