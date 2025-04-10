import { Module } from '@nestjs/common';
import { CustomerService } from '../services';
import { CustomerController } from '../controllers/';
import { TypeOrmModule } from '@nestjs/typeorm';
import Customer from '../entities/customer.entity';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export default class CustomerModule {}
