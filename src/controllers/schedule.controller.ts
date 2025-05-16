import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedue.service';
import Schedule from '../entities/schedule.entity';
import { UpdateScheduleDTO } from '../dtos';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../decorators/role.decorators';
import { RoleEnum } from '../enums/role.enum';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async get(): Promise<Schedule[]> {
    return await this.scheduleService.get();
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateScheduleDTO,
  ): Promise<Schedule> {
    return await this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async delete(@Param('id') id: number) {
    return this.scheduleService.delete(id);
  }
}
