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
import { UserService } from '../services/user.service';
import { UserResponseDto, UserCreateDto, UserUpdateDto } from '../dtos';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../decorators/role.decorators';
import { RoleEnum } from '../enums/role.enum';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async get(@Query('param') param: string): Promise<UserResponseDto[]> {
    return await this.userService.get(param);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async getById(@Param('id') id: number) {
    return await this.userService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async create(@Body() crateDto: UserCreateDto) {
    return await this.userService.create(crateDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async update(@Param('id') id: number, @Body() dto: UserUpdateDto) {
    return await this.userService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }
}
