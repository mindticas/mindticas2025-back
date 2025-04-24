import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, Treatment } from '../entities';
import { StatisticsService } from '../services';
import { StatisticsController } from '../controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Treatment])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export default class StatisticsModule {}
