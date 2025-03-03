import { Test, TestingModule } from '@nestjs/testing';
import CustomerController from './customer.controller';
import { CustomerService } from '../services';
import { CustomerRegisterDto } from '../dtos';
import { Customer } from '../entities';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
describe('CustomerController', () => {
  let controller: CustomerController;
  let service: CustomerService;
  let validationPipe: ValidationPipe;
  const mockCustomerService = {
    createCustomer: jest.fn((dto) => {
      if (
        !dto.name ||
        !dto.phone ||
        dto.name.length > 50 ||
        dto.phone.length > 15
      ) {
        throw new BadRequestException('Invalid customer data');
      }
      return { id: 1, ...dto };
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();
    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
    validationPipe = new ValidationPipe();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create a new customer with valid data', async () => {
    const dto: CustomerRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '3125463221',
    };
    const validatedDto = await validationPipe.transform(dto, {
      metatype: CustomerRegisterDto,
      type: 'body',
    });
    const expectedResponse: Partial<Customer> = {
      id: 1,
      name: 'Leonel Ceballos',
      phone: '3125463221',
    };
    const response = await controller.createCustomer(validatedDto);
    await expect(response).toEqual(expect.objectContaining(expectedResponse));
    expect(service.createCustomer).toHaveBeenCalledWith(dto);
  });
  it('should throw an error if name is empty', async () => {
    const dto: CustomerRegisterDto = {
      name: '',
      phone: '3125463221',
    };
    await expect(
      validationPipe.transform(dto, {
        metatype: CustomerRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it('should throw an error if phone is empty', async () => {
    const dto: CustomerRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '',
    };
    await expect(
      validationPipe.transform(dto, {
        metatype: CustomerRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it('should throw an error if name exceeds max length', async () => {
    const dto: CustomerRegisterDto = {
      name: 'A'.repeat(51),
      phone: '3125463221',
    };
    await expect(
      validationPipe.transform(dto, {
        metatype: CustomerRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it('should throw an error if phone exceeds max length', async () => {
    const dto: CustomerRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '1'.repeat(16),
    };
    await expect(
      validationPipe.transform(dto, {
        metatype: CustomerRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
