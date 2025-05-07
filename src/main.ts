import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SeedService } from './services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.enableCors({
    origin: ['http://localhost:3000', process.env.URL_WEB],
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
  try {
    logger.log('Database connected');
    try {
      logger.log('Iniciando ejecución de seeds...');
      const seedService = app.get(SeedService);
      await seedService.run();
      logger.log('Seeds ejecutadas correctamente');
    } catch (seedError) {
      logger.error(
        `Error ejecutando seeds: ${seedError.message}`,
        seedError.stack,
      );
      logger.warn(
        'Continuando con el inicio de la aplicación a pesar del error en seeds',
      );
    }
  } catch (dbError) {
    logger.error(
      `Database connection error: ${dbError.message}`,
      dbError.stack,
    );
  }

  await app.listen(3000);
  logger.log(`Application running on port 3000`);
}

bootstrap();
