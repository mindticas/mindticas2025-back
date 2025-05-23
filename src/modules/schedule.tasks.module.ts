import { forwardRef, Module } from '@nestjs/common';
import { ScheduleTasksService } from '../services/index';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities/index';
import { SchedulerRegistry } from '@nestjs/schedule';
import WhatsAppModule from './whatsapp.module';
import AppointmentModule from './appointment.module';
import GoogleCalendarModule from './google.calendar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    forwardRef(() => AppointmentModule),
    forwardRef(() => WhatsAppModule),
    forwardRef(() => GoogleCalendarModule),
  ],
  providers: [ScheduleTasksService, SchedulerRegistry],
  exports: [ScheduleTasksService],
})
export default class ScheduleTasksModule {}
