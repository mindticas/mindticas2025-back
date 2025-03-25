import { Module } from '@nestjs/common';
import { GoogleCalendarService } from '../services';

@Module({
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export default class GoogleCalendarModule {}
