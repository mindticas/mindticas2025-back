import { forwardRef, Module } from '@nestjs/common';
import { AppointmentService } from '../services';
import { AppointmentController } from '../controllers/';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, User, Customer, Treatment } from '../entities';
import WhatsAppModule from './whatsapp.module';
import CustomerModule from './customer.module';
import GoogleCalendarModule from './google.calendar.module';
import { ScheduleTasksModule } from './index';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Customer, Treatment]),
    forwardRef(() => CustomerModule),
    forwardRef(() => WhatsAppModule),
    forwardRef(() => ScheduleTasksModule),
    GoogleCalendarModule,
    AuthModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export default class AppointmentModule {}
