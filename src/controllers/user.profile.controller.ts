import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserProfile } from '../entities';
import { UserProfileService } from '../services';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserProfileDto } from '../dtos';

@Controller('userProfile')
export default class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Get()
  async get(): Promise<UserProfile[]> {
    return await this.userProfileService.get();
  }

  @Patch(':id')
  //@UseGuards(AuthGuard)
  async update(@Param('id') id: number, @Body() dto: UpdateUserProfileDto) {
    return await this.userProfileService.update(id, dto);
  }
}
