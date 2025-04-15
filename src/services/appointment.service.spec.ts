import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from '../services';
import { Appointment, User, Customer, Treatment } from '../entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppointmentRegisterDto } from '../dtos';
import CustomerService from '../services/customer.service';
import { Status } from '../enums/appointments.status.enum';
import WhatsAppService from '../services/whatsapp.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GoogleCalendarService } from './index';

const mockAppointmentRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserRepository = {
  find: jest.fn(),
};

const mockCustomerRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockTreatmentRepository = {
  find: jest.fn(),
};

const mockCustomerService = {
  createCustomer: jest.fn(),
};

const mockWhatsAppService = {
  sendMessage: jest.fn(),
  sendInteractiveMessage: jest.fn(),
};

const mockGoogleCalendarService = {
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
};

const mockUser = {
  id: 1,
  name: 'Doctor Example',
};

const mockCustomer = {
  id: 1,
  name: 'Leonel Ceballos',
  phone: '3125463221',
  appointments: [],
};

const mockTreatments = [
  {
    id: 1,
    name: 'Haircut',
    price: 50,
    duration: 30,
    description: 'Standard haircut',
    appointments: [],
  },
];

const mockAppointment = {
  id: 1,
  status: Status.PENDING,
  scheduled_start: new Date('2025-03-10T14:00:00Z'),
  total_price: 100.5,
  duration: 60,
  user: mockUser,
  customer: mockCustomer,
  treatments: mockTreatments,
};

const createDto: AppointmentRegisterDto = {
  name: 'Leonel Ceballos',
  phone: '3125463221',
  scheduled_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ahead
  treatment_ids: [1],
};

describe('AppointmentService', () => {
  let service: AppointmentService;
  let appointmentRepository: Repository<Appointment>;
  let userRepository: Repository<User>;
  let customerRepository: Repository<Customer>;
  let treatmentRepository: Repository<Treatment>;
  let customerService: CustomerService;
  let whatsAppService: WhatsAppService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Treatment),
          useValue: mockTreatmentRepository,
        },
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
        {
          provide: WhatsAppService,
          useValue: mockWhatsAppService,
        },
        {
          provide: SchedulerRegistry,
          useValue: {},
        },
        { provide: GoogleCalendarService, useValue: mockGoogleCalendarService },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    customerRepository = module.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    treatmentRepository = module.get<Repository<Treatment>>(
      getRepositoryToken(Treatment),
    );
    customerService = module.get<CustomerService>(CustomerService);
    whatsAppService = module.get<WhatsAppService>(WhatsAppService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return all appointments', async () => {
      mockAppointmentRepository.find.mockResolvedValue([mockAppointment]);

      const result = await service.get();
      expect(result).toEqual([mockAppointment]);
    });
  });

  describe('create', () => {
    it('should create an appointment successfully', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      mockTreatmentRepository.find.mockResolvedValue(mockTreatments);
      mockAppointmentRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockAppointmentRepository.create.mockReturnValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto);
      expect(result).toEqual(mockAppointment);
      expect(mockWhatsAppService.sendInteractiveMessage).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no treatments found', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      mockTreatmentRepository.find.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Service duration not found',
      );
    });

    it('Should throw BadRequestException if appt exists', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      mockTreatmentRepository.find.mockResolvedValue(mockTreatments);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'An appointment is already scheduled at this time.',
      );
    });

    it('should create a new customer if not found', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      mockTreatmentRepository.find.mockResolvedValue(mockTreatments);
      mockAppointmentRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerService.createCustomer.mockResolvedValue(mockCustomer);
      mockAppointmentRepository.create.mockReturnValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto);
      expect(result).toEqual(mockAppointment);
      expect(mockCustomerService.createCustomer).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on save', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      mockTreatmentRepository.find.mockResolvedValue(mockTreatments);
      mockAppointmentRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockAppointmentRepository.create.mockReturnValue(mockAppointment);
      mockAppointmentRepository.save.mockRejectedValue(
        new Error('Error creating appointment'),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Error creating appointment',
      );
    });
  });
});
