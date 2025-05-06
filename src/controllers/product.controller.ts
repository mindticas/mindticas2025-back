import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Product } from '../entities';
import { ProductService } from '../services';
import { ProductUpdateDto, ProductCreateDto } from '../dtos';
import { Roles } from '../decorators/role.decorators';
import { RoleEnum } from '../enums/role.enum';
import { RolesGuard } from '../auth/role.guard';

@Controller('products')
export default class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.EMPLOYEE)
  async get(): Promise<Product[]> {
    return await this.productService.get();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.EMPLOYEE)
  async getById(@Param('id') id: number) {
    return await this.productService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async create(@Body() crateDto: ProductCreateDto) {
    return await this.productService.create(crateDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async update(@Param('id') id: number, @Body() dto: ProductUpdateDto) {
    return await this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async delete(@Param('id') id: number) {
    return await this.productService.delete(id);
  }
}
