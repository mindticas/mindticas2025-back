import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppointmentService } from '../services';
import { AppointmentRegisterDto } from '../dtos';
import { Appointment } from '../entities';

@Controller('appointment')
export default class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async getAllAppointments(): Promise<Appointment[]> {
    return await this.appointmentService.getAllAppointments();
  }

  @Post()
  async createAppointment(
    @Body() dto: AppointmentRegisterDto,
  ): Promise<Appointment> {
    const appointment = await this.appointmentService.createAppointment(dto);
    return appointment;
  }
}
