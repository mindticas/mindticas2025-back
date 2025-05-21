import { forwardRef, Module } from '@nestjs/common';
import { AppointmentService } from '../services';
import { AppointmentController } from '../controllers/';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, User, Customer, Treatment, Product } from '../entities';
import WhatsAppModule from './whatsapp.module';
import CustomerModule from './customer.module';
import GoogleCalendarModule from './google.calendar.module';
import { ScheduleTasksModule, ProductModule } from './index';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Customer, Treatment, Product]),
    forwardRef(() => CustomerModule),
    forwardRef(() => WhatsAppModule),
    forwardRef(() => ScheduleTasksModule),
    forwardRef(() => ProductModule),
    GoogleCalendarModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export default class AppointmentModule {}
