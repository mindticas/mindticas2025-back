import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import Schedule from '../entities/schedule.entity';
import { CreateScheduleDTO, UpdateScheduleDTO } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  get(): Promise<Schedule[]> {
    try {
      return this.scheduleRepository.find();
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedule');
    }
  }

  async update(id: number, dto: UpdateScheduleDTO): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOneBy({ id });

    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    Object.assign(schedule, dto);
    try {
      return this.scheduleRepository.save(schedule);
    } catch (error) {
      throw new BadRequestException(`Failed to update schedule`);
    }
  }

  async delete(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule) throw new BadRequestException('Schedule not found');
    try {
      return this.scheduleRepository.remove(schedule);
    } catch (error) {
      throw new BadRequestException(`Failed to delete schedule`);
    }
  }
}
