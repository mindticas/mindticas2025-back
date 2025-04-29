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

@Controller('product')
export default class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @UseGuards(AuthGuard)
  async get(): Promise<Product[]> {
    return await this.productService.get();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Param('id') id: number) {
    return await this.productService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() crateDto: ProductCreateDto) {
    return await this.productService.create(crateDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: number, @Body() dto: ProductUpdateDto) {
    return await this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: number) {
    return await this.productService.delete(id);
  }
}
