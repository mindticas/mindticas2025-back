import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from '../services';
import {
  AppointmentRegisterDto,
  AppointmentUpdateDto,
  AppointmentResponseDto,
} from '../dtos';
import { Appointment } from '../entities';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../decorators/role.decorators';
import { RoleEnum } from '../enums/role.enum';

@Controller('appointment')
export default class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async get(): Promise<AppointmentResponseDto[]> {
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
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.EMPLOYEE)
  async update(
    @Param('id') id: number,
    @Body() dto: AppointmentUpdateDto,
  ): Promise<Appointment> {
    return await this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async delete(@Param('id') id: number) {
    return this.appointmentService.delete(id);
  }
}
