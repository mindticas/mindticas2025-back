import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Appointment, User, Customer, Treatment } from '../entities/';
import { AppointmentRegisterDto, CustomerRegisterDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import CustomerService from './customer.service';

@Injectable()
export default class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
    private readonly customerService: CustomerService,
  ) {}

  async getAllAppointments(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: { treatments: true },
    });
  }

  async createAppointment(
    createDto: AppointmentRegisterDto,
  ): Promise<Appointment> {
    const customerDto = new CustomerRegisterDto();
    customerDto.name = createDto.nameCustomer;
    customerDto.phone = createDto.phoneCustomer;
    const userEntity = await this.userRepository.findOne({ where: { id: 1 } });
    const treatments = await this.treatmentRepository.find({
      where: { id: In(createDto.service_id) },
    });

    const serviceDuration = treatments[0].duration;
    if (!serviceDuration) {
      throw new BadRequestException('Service duration not found');
    }

    const scheduledStart = new Date(createDto.scheduledStart);

    const existingAppointment = await this.appointmentRepository.findOne({
      where: [
        {
          scheduled_start: scheduledStart,
        },
      ],
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'An appointment is already scheduled at this time.',
      );
    }

    const existingCustomer = await this.customerRepository.findOne({
      where: { phone: createDto.phoneCustomer },
    });

    if (!existingCustomer) {
      const customer = await this.customerService.createCustomer(customerDto);
    }

    const totalPrice = treatments[0].price;

    console.log(serviceDuration);

    const appointment = this.appointmentRepository.create({
      status: 'peding',
      scheduled_start: scheduledStart,
      total_price: totalPrice,
      duration: serviceDuration,
      user: userEntity,
      customer: existingCustomer,
      treatments: treatments,
    });

    try {
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      throw new BadRequestException(
        `Error creating appointment: ${error.message}`,
      );
    }
  }
}
