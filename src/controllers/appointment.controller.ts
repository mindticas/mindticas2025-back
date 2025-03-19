import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AppointmentService } from '../services';
import { AppointmentRegisterDto, AppointmentUpdateDto } from '../dtos';
import { Appointment } from '../entities';

@Controller('appointment')
export default class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async get(): Promise<Appointment[]> {
    return await this.appointmentService.get();
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.appointmentService.getById(id);
  }

  @Post()
  async create(@Body() dto: AppointmentRegisterDto): Promise<Appointment> {
    return await this.appointmentService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    dto: AppointmentUpdateDto,
  ): Promise<Appointment> {
    return await this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.appointmentService.delete(id);
  }
}
