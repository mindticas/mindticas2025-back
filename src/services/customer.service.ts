import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from '../entities';
import { CustomerRegisterDto, CustomerResponseDto, UserNameDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export default class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async get(param: string): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({
      relations: {
        appointments: {
          user: true,
          treatments: true,
        },
      },
    });

    const users = customers.map((customer) => {
      const customerResponse = new CustomerResponseDto();
      customerResponse.id = customer.id;
      customerResponse.name = customer.name;
      customerResponse.phone = customer.phone;

      this.customerMapping(customerResponse, customer);

      return customerResponse;
    });

    if (param) {
      return await this.filters(users, param);
    }

    return users;
  }

  async getById(id: number): Promise<CustomerResponseDto> {
    const customer = await this.searchForId(id);

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const customerResponse = new CustomerResponseDto();
    customerResponse.id = customer.id;
    customerResponse.name = customer.name;
    customerResponse.phone = customer.phone;

    this.customerMapping(customerResponse, customer);

    return customerResponse;
  }

  async filters(customers, param: string): Promise<CustomerResponseDto[]> {
    if (param === 'SERVICE_COUNT_ASC') {
      return customers.sort((a, b) => a.id - b.id);
    } else if (param === 'SERVICE_COUNT_DESC') {
      return customers.sort((a, b) => b.id - a.id);
    } else if (param === 'CUSTOMER_NAME_ASC') {
      return customers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (param === 'CUSTOMER_NAME_DESC') {
      return customers.sort((a, b) => b.name.localeCompare(a.name));
    }
  }

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

  async searchForId(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: {
        appointments: {
          user: true,
          treatments: true,
        },
      },
    });
    if (!customer) {
      throw new NotFoundException(`Cliente con ID: ${id} no encontrado`);
    }
    return customer;
  }

  async customerMapping(
    customerResponse,
    customer,
  ): Promise<CustomerResponseDto[]> {
    customerResponse.appointments = customer.appointments.map((appointment) => {
      const userNameDto = new UserNameDto();
      userNameDto.name = appointment.user.name;

      return {
        ...appointment,
        user: userNameDto,
      };
    });

    return customerResponse;
  }
}
