import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from '../services';

export async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  await seedService.run();
  await app.close();
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Error ejecutando seeders:', err);
    process.exit(1);
  });
}
