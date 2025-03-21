import { Module } from '@nestjs/common';
import { TreatmentController } from '../controllers';
import { TreatmentService } from '../services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment])],
  controllers: [TreatmentController],
  providers: [TreatmentService],
  exports: [TypeOrmModule],
})
export default class TreatmentModule {}
