import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [],
  exports: [TypeOrmModule],
})
export default class RoleModule {}
