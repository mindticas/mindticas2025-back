import { forwardRef, Module } from '@nestjs/common';
import { AppointmentService } from '../services';
import { AppointmentController } from '../controllers/';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, User, Customer, Treatment } from '../entities';
import { CustomerModule, WhatsAppModule } from './index';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, Customer, Treatment]),
    forwardRef(() => CustomerModule),
    WhatsAppModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export default class AppointmentModule {}
