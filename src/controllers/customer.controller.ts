import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CustomerRegisterDto, CustomerResponseDto } from '../dtos';
import { CustomerService } from '../services';
import { Customer } from '../entities';

@Controller('customer')
export default class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('sort')
  async filters(@Query('param') param: string) {
    return await this.customerService.filters(param);
  }

  @Get()
  async get(): Promise<CustomerResponseDto[]> {
    return await this.customerService.get();
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return await this.customerService.getById(id);
  }

  @Post()
  async createCustomer(@Body() body: CustomerRegisterDto): Promise<Customer> {
    const customer = await this.customerService.createCustomer(body);
    return customer;
  }
}
