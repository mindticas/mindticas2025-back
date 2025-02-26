import { Module } from '@nestjs/common';
import { CustomerService } from '../services';
import { CustomerController } from '../controllers/';
import { TypeOrmModule } from '@nestjs/typeorm';
import Customer from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export default class CustomerModule {}
