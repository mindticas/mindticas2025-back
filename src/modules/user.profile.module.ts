import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from '../entities';
import { UserProfileController } from '../controllers';
import { UserProfileService } from '../services';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [TypeOrmModule, UserProfileService],
})
export default class UserProfileModule {}
