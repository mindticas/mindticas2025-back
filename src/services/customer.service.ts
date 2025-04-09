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

  async get(): Promise<CustomerResponseDto[]> {
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
