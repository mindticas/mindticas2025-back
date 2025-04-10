import { Module } from '@nestjs/common';
import { ScheduleController } from '../controllers/schedule.controller';
import { ScheduleService } from '../services/schedue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Schedule from '../entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [TypeOrmModule],
})
export default class SchedulingModule {}
