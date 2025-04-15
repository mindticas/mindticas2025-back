import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role, Schedule, Treatment } from '../entities';
import { UserSeed, RoleSeed, ScheduleSeed, TreatmentSeed } from '../seeds';
import { SeedService } from '../services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Schedule, Treatment])],
  providers: [SeedService, UserSeed, RoleSeed, ScheduleSeed, TreatmentSeed],
  exports: [SeedService],
})
export default class SeedModule {}
