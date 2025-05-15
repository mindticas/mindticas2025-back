import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserProfile } from '../entities';
import { UserProfileService } from '../services';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserProfileDto } from '../dtos';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../decorators/role.decorators';
import { RoleEnum } from '../enums/role.enum';

@Controller('userProfile')
export default class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Get()
  async get(): Promise<UserProfile[]> {
    return await this.userProfileService.get();
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async update(@Param('id') id: number, @Body() dto: UpdateUserProfileDto) {
    return await this.userProfileService.update(id, dto);
  }
}
