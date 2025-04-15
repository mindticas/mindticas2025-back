import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities';
import { StatisticsService } from '../services';
import { StatisticsController } from '../controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export default class StatisticsModule {}
