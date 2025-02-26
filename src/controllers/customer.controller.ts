import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomerRegisterDto } from '../dtos';
import { CustomerService } from '../services';
import { Customer } from '../entities';

@Controller('customer')
export default class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(@Body() body: CustomerRegisterDto): Promise<Customer> {
    const customer = await this.customerService.createCustomer(body);
    return customer;
  }
}
