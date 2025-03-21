import { Test, TestingModule } from '@nestjs/testing';
import AppointmentController from './appointment.controller';
import { AppointmentService } from '../services';
import AppointmentRegisterDto from '../dtos/appointment.register.dto';
import { Appointment } from '../entities';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Status } from '../enums/appointments.status.enum';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: AppointmentService;
  let validationPipe: ValidationPipe;

  const mockAppointmentService = {
    get: jest.fn((): Appointment[] => [
      {
        id: 1,
        status: Status.PENDING,
        scheduled_start: new Date('2025-03-10T14:00:00Z'),
        total_price: 100.5,
        duration: 60,
        user: {
          id: 1,
          name: 'Kevin barber',
          role: { id: 1, name: 'admin', users: [] },
          phone: '3121290001',
          email: 'kevin@gmail.com',
          password: 'password123',
          appointments: [],
        },
        customer: {
          id: 1,
          name: 'Leonel Ceballos',
          phone: '3125463221',
          appointments: [],
        },
        treatments: [
          {
            id: 1,
            name: 'Buzz cut',
            price: 100,
            duration: 60,
            description: 'Corte buzz cut clasico',
            appointments: [],
          },
        ],
        created_at: undefined,
        updated_at: undefined,
      },
    ]),

    create: jest
      .fn()
      .mockImplementation(async (dto: AppointmentRegisterDto) => {
        if (!dto.scheduled_start || !dto.treatment_ids || !dto.name) {
          throw new Error('Error creating appointment');
        }
        return {
          id: Math.floor(Math.random() * 1000),
          status: Status.PENDING,
          scheduled_start: new Date(dto.scheduled_start),
          total_price: 120.75,
          duration: 90,
          user: {
            id: 1,
            name: 'Kevin barber',
            role: 'admin',
            phone: '3121290001',
            email: 'kevin@gmail.com',
            password: 'password123',
            appointments: [],
          },
          customer: {
            id: 2,
            name: dto.name,
            phone: dto.phone,
            appointments: [],
          },
          treatments: dto.treatment_ids.map((id) => ({
            id,
            name: `Treatment ${id}`,
            price: 50,
            duration: 30,
            description: 'Standard treatment',
            appointments: [],
          })),
        };
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get<AppointmentService>(AppointmentService);
    validationPipe = new ValidationPipe();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all appointments', async () => {
    const result = await controller.get();
    expect(result).toHaveLength(1);
    expect(service.get).toHaveBeenCalled();
  });

  it('should create a new appointment with valid data', async () => {
    const dto: AppointmentRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '3125463221',
      scheduled_start: '2025-03-15T10:00:00Z',
      treatment_ids: [1, 3],
    };

    const validatedDto = await validationPipe.transform(dto, {
      metatype: AppointmentRegisterDto,
      type: 'body',
    });

    const response = await controller.create(validatedDto);

    const expectedResponse: Partial<Appointment> = {
      id: expect.any(Number),
      status: Status.PENDING,
      scheduled_start: expect.any(Date),
      total_price: expect.any(Number),
      duration: expect.any(Number),
      user: {
        id: expect.any(Number),
        name: expect.any(String),
        role: expect.any(String),
        phone: expect.any(String),
        email: expect.any(String),
        password: expect.any(String),
        appointments: expect.any(Array),
      },
      customer: {
        id: expect.any(Number),
        name: 'Leonel Ceballos',
        phone: '3125463221',
        appointments: expect.any(Array),
      },
      treatments: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          price: expect.any(Number),
        }),
      ]),
    };

    await expect(response).toEqual(expect.objectContaining(expectedResponse));
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should throw an error if name is empty', async () => {
    const dto: AppointmentRegisterDto = {
      name: '',
      phone: '3125463221',
      scheduled_start: '2025-03-20T15:00:00Z',
      treatment_ids: [1],
    };

    await expect(
      validationPipe.transform(dto, {
        metatype: AppointmentRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if phone is empty', async () => {
    const dto: AppointmentRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '',
      scheduled_start: '2025-03-20T15:00:00Z',
      treatment_ids: [1],
    };

    await expect(
      validationPipe.transform(dto, {
        metatype: AppointmentRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if scheduledStart is empty', async () => {
    const dto: AppointmentRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '3125463221',
      scheduled_start: '',
      treatment_ids: [1],
    };

    await expect(
      validationPipe.transform(dto, {
        metatype: AppointmentRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if service_id is empty', async () => {
    const dto: AppointmentRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '3125463221',
      scheduled_start: '2025-03-20T15:00:00Z',
      treatment_ids: [],
    };

    await expect(
      validationPipe.transform(dto, {
        metatype: AppointmentRegisterDto,
        type: 'body',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException on save failure', async () => {
    const dto: AppointmentRegisterDto = {
      name: 'Leonel Ceballos',
      phone: '3125463221',
      scheduled_start: '2025-03-20T15:00:00Z',
      treatment_ids: [1],
    };

    mockAppointmentService.create.mockRejectedValue(
      new Error('Error creating appointment'),
    );

    await expect(controller.create(dto)).rejects.toThrow(
      'Error creating appointment',
    );
  });
});
