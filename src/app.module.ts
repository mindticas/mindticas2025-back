import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  SeedModule,
  WhatsAppModule,
  GoogleCalendarModule,
  StatisticsModule,
  UserProfileModule,
  ProductModule,
  SchedulingModule,
} from './modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { ScheduleModule } from '@nestjs/schedule';
import googleConfig from './config/google.config';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env}`,
      load: [googleConfig],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    SeedModule,
    WhatsAppModule,
    GoogleCalendarModule,
    AuthModule,
    StatisticsModule,
    ScheduleModule,
    SchedulingModule,
    ProductModule,
    UserProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
