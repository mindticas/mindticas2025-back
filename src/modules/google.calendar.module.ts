import { Module } from '@nestjs/common';
import { GoogleCalendarService } from '../services';
import { GoogleCalendarController } from '../controllers';
import { GoogleTokenService } from '../services/index';
import { Appointment, GoogleToken } from '../entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleToken, Appointment]), AuthModule],
  providers: [GoogleCalendarService, GoogleTokenService],
  controllers: [GoogleCalendarController],
  exports: [GoogleCalendarService],
})
export default class GoogleCalendarModule {}
