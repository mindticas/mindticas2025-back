import { Module } from '@nestjs/common';
import { GoogleCalendarService } from '../services';
import { GoogleCalendarController } from '../controllers';
import { GoogleTokenService } from '../services/index';
import { GoogleToken } from '../entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleToken])],
  providers: [GoogleCalendarService, GoogleTokenService],
  controllers: [GoogleCalendarController],
  exports: [GoogleCalendarService],
})
export default class GoogleCalendarModule {}
