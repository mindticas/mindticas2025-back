import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../services';
import { Customer } from '../entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CustomerRegisterDto } from '../dtos';

const mockCustomerRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockCustomer = {
  id: 1,
  name: 'Leonel Ceballos',
  phone: '3125463221',
  appointments: [],
};

const customerDto: CustomerRegisterDto = {
  name: 'Leonel Ceballos',
  phone: '3125463221',
};

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: Repository<Customer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should successfully create a new customer', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(customerDto);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw BadRequestException if customer already exists', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(service.createCustomer(customerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createCustomer(customerDto)).rejects.toThrow(
        'Existing customer',
      );
    });

    it('should throw BadRequestException if save fails', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.save.mockRejectedValue(
        new BadRequestException('Error saving customer'),
      );

      await expect(service.createCustomer(customerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createCustomer(customerDto)).rejects.toThrow(
        'Error saving customer',
      );
    });
  });
});
