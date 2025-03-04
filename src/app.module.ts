import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TreatmentModule, CustomerModule, AppointmentModule } from './modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { SeedService } from './services';
import { RoleSeed, UserSeed } from './seeds';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env}`,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    TreatmentModule,
    CustomerModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService, RoleSeed, UserSeed],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.run();
  }
}
