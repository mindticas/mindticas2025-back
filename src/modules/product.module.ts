import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities';
import { ProductService } from '../services';
import { ProductController } from '../controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule, ProductService],
})
export default class ProductModule {}
