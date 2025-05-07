import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from '../services';
import { AuthGuard } from '../auth/auth.guard';
import { roleResponseDto } from '../dtos';

@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @UseGuards(AuthGuard)
  async get(): Promise<roleResponseDto[]> {
    return await this.roleService.get();
  }
}
