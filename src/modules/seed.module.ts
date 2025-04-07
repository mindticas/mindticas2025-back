import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role, Schedule } from '../entities';
import { UserSeed, RoleSeed, ScheduleSeed } from '../seeds';
import { SeedService } from '../services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Schedule])],
  providers: [SeedService, UserSeed, RoleSeed, ScheduleSeed],
  exports: [SeedService],
})
export default class SeedModule {}
