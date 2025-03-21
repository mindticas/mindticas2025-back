import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from '../services';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  await seedService.run();
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error ejecutando seeders:', err);
  process.exit(1);
});
