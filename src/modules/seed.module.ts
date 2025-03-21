import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role } from '../entities';
import { UserSeed, RoleSeed } from '../seeds';
import { SeedService } from '../services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [SeedService, UserSeed, RoleSeed],
  exports: [SeedService],
})
export default class SeedModule {}
