import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  AppDataSource.initialize()
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection error:', err));
  await app.listen(3000);
}

bootstrap();
