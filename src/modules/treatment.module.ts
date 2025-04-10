import { Module } from '@nestjs/common';
import { TreatmentController } from '../controllers';
import { TreatmentService } from '../services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from '../entities';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment]), AuthModule],
  controllers: [TreatmentController],
  providers: [TreatmentService],
  exports: [TreatmentService],
})
export default class TreatmentModule {}
