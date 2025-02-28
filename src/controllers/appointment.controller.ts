import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppointmentService } from '../services';
import { AppointmentRegisterDto } from '../dtos';
import { Appointment } from '../entities';

@Controller('appointment')
export default class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async get(): Promise<Appointment[]> {
    return await this.appointmentService.get();
  }

  @Post()
  async create(@Body() dto: AppointmentRegisterDto): Promise<Appointment> {
    const appointment = await this.appointmentService.create(dto);
    return appointment;
  }
}
