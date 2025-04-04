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
import { ScheduleService } from '../services/schedue.service';
import Schedule from '../entities/schedule.entity';
import { CreateScheduleDTO, UpdateScheduleDTO } from '../dtos';
import { AuthGuard } from '../auth/auth.guard';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async get(): Promise<Schedule[]> {
    return await this.scheduleService.get();
  }

  @Post()
  async create(@Body() dto: CreateScheduleDTO[]): Promise<Schedule[]> {
    return await this.scheduleService.create(dto);
  }

  @Patch(':id')
  //@UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateScheduleDTO,
  ): Promise<Schedule> {
    return await this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: number) {
    return this.scheduleService.delete(id);
  }
}
