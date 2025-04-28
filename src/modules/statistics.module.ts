import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities';
import { StatisticsService } from '../services';
import { StatisticsController } from '../controllers';
import TreatmentModule from './treatment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), TreatmentModule],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export default class StatisticsModule {}
