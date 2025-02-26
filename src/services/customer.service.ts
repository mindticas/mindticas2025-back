import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from '../entities';
import { CustomerRegisterDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export default class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(createDto: CustomerRegisterDto): Promise<Customer> {
    const customerEntity = await this.customerRepository.findOne({
      where: { phone: createDto.phone },
    });

    const customerPhone = customerEntity;
    if (customerPhone) {
      throw new BadRequestException('Existing customer');
    }

    const customer = this.customerRepository.create(createDto);
    try {
      return await this.customerRepository.save(customer);
    } catch (error) {
      throw new BadRequestException(
        `Error creating customer: ${error.message}`,
      );
    }
  }
}
