import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Schedule, Treatment } from '../entities';
import { UserSeed, ScheduleSeed, TreatmentSeed } from '../seeds';
import { SeedService } from '../services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Schedule, Treatment])],
  providers: [SeedService, UserSeed, ScheduleSeed, TreatmentSeed],
  exports: [SeedService],
})
export default class SeedModule {}
