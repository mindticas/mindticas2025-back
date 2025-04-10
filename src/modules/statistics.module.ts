import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities';
import { StatisticsService } from '../services';
import { StatisticsController } from '../controllers';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), AuthModule],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export default class StatisticsModule {}
