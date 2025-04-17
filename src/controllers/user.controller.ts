import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserResponseDto, UserCreateDto, UserUpdateDto } from '../dtos';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async get(@Param('param') param: string): Promise<UserResponseDto[]> {
    return await this.userService.get(param);
  }

  @Post()
  async create(@Body() crateDto: UserCreateDto) {
    return await this.userService.create(crateDto);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UserUpdateDto) {
    return await this.userService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }
}
