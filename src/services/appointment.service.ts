import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Appointment, User, Customer, Treatment } from '../entities/';
import { AppointmentRegisterDto, CustomerRegisterDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import CustomerService from './customer.service';
import { Status } from '../enums/appointments.status.enum';

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

  get(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: { treatments: true },
    });
  }

  async create(createDto: AppointmentRegisterDto): Promise<Appointment> {
    const customerDto = new CustomerRegisterDto();
    customerDto.name = createDto.name;
    customerDto.phone = createDto.phone;
    const userEntity = await this.userRepository.find({
      take: 1,
    });
    const user = userEntity[0];
    const treatments = await this.treatmentRepository.find({
      where: { id: In(createDto.treatment_ids) },
    });

    const serviceDuration = treatments.reduce(
      (sum, treatment) => sum + Number(treatment.duration),
      0,
    );
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

    let customer = await this.customerRepository.findOne({
      where: { phone: createDto.phone },
    });
    if (!customer) {
      const customerDto = new CustomerRegisterDto();
      customerDto.name = createDto.name;
      customerDto.phone = createDto.phone;
      customer = await this.customerService.createCustomer(customerDto);
    }

    const totalPrice = treatments.reduce(
      (sum, treatment) => sum + Number(treatment.price),
      0,
    );

    const appointment = this.appointmentRepository.create({
      status: Status.PENDING,
      scheduled_start: scheduledStart,
      total_price: totalPrice,
      duration: serviceDuration,
      user: user,
      customer: customer,
      treatments: treatments,
    });

    console.log(appointment);

    try {
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      throw new BadRequestException(
        `Error creating appointment: ${error.message}`,
      );
    }
  }
}
