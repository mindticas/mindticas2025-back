import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  TreatmentModule,
  CustomerModule,
  AppointmentModule,
  UserModule,
  RoleModule,
  SeedModule,
  WhatsAppModule,
  GoogleCalendarModule,
  StatisticsModule,
} from './modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { ScheduleModule } from '@nestjs/schedule';
import googleConfig from './config/google.config';
import { AuthModule } from './modules/auth.module';
import whapiConfig from './config/whapi.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env}`,
      load: [googleConfig, whapiConfig, authConfig],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    TreatmentModule,
    CustomerModule,
    AppointmentModule,
    UserModule,
    RoleModule,
    SeedModule,
    WhatsAppModule,
    GoogleCalendarModule,
    AuthModule,
    UserModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
