import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Appointment, User, Customer, Treatment } from '../entities/';
import { AppointmentRegisterDto, CustomerRegisterDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../enums/appointments.status.enum';
import CustomerService from './customer.service';
import WhatsAppService from './whatsapp.service';
import * as messages from '../templates/whatsapp.messages.json';
import { formatMessage, generateParams } from '../utils/messageFormatter';

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
    private readonly whatsAppService: WhatsAppService,
  ) {}

  get(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: { treatments: true },
    });
  }

  async create(createDto: AppointmentRegisterDto): Promise<Appointment> {
    const user = await this.getUser();
    const treatments = await this.getTreatments(createDto.treatment_ids);
    const serviceDuration = this.calculateServiceDuration(treatments);
    const scheduledStart = new Date(createDto.scheduled_start);

    this.validateAppointment(scheduledStart);
    await this.ensureNoExistingAppointment(scheduledStart);

    const customer = await this.getOrCreateCustomer(createDto);

    const totalPrice = this.calculateTotalPrice(treatments);

    const appointment = this.appointmentRepository.create({
      status: Status.PENDING,
      scheduled_start: scheduledStart,
      total_price: totalPrice,
      duration: serviceDuration,
      user,
      customer,
      treatments,
    });

    try {
      const savedAppointment = await this.appointmentRepository.save(appointment);
      await this.sendAppointmentConfirmationMessage(customer.phone, scheduledStart, treatments);
      return savedAppointment;
    } catch (error) {
      throw new BadRequestException(`Error creating appointment: ${error.message}`);
    }
  }

  async getLastAppointmentByPhone(phone: string): Promise<Appointment> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { phone },
      });

      if (!customer) {
        return null;
      }

      return this.appointmentRepository.findOne({
        where: { customer },
        order: { id: 'DESC' },
        relations: ['treatments'],
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener la última cita: ${error.message}`);
    }
  }

  async updateStatus(appointmentId: number, status: Status) {
    const appointment = await this.appointmentRepository.findOneBy({ id: appointmentId });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID: ${appointmentId} not found`);
    }
    appointment.status = status;
    await this.appointmentRepository.save(appointment);
    return appointment;
  }

  private async getUser(): Promise<User> {
    const userEntity = await this.userRepository.find({ take: 1 });
    return userEntity[0];
  }

  private async getTreatments(treatmentIds: number[]): Promise<Treatment[]> {
    return this.treatmentRepository.find({
      where: { id: In(treatmentIds) },
    });
  }

  private calculateServiceDuration(treatments: Treatment[]): number {
    const duration = treatments.reduce((sum, treatment) => sum + Number(treatment.duration), 0);
    if (!duration) throw new BadRequestException('Service duration not found');
    return duration;
  }

  private validateAppointment(start: Date): void {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    if (start > maxDate || start < today) {
      throw new BadRequestException('Appointments must be scheduled within the next 7 days and cannot be in the past.');
    }
  }

  private async ensureNoExistingAppointment(scheduledStart: Date): Promise<void> {
    const existingAppointment = await this.appointmentRepository.findOne({
      where: { scheduled_start: scheduledStart },
    });

    if (existingAppointment) {
      throw new BadRequestException('An appointment is already scheduled at this time.');
    }
  }

  private async getOrCreateCustomer(createDto: AppointmentRegisterDto): Promise<Customer> {
    let customer = await this.customerRepository.findOne({ where: { phone: createDto.phone } });

    if (!customer) {
      const customerDto = new CustomerRegisterDto();
      customerDto.name = createDto.name;
      customerDto.phone = createDto.phone;
      customer = await this.customerService.createCustomer(customerDto);
    }
    return customer;
  }

  private calculateTotalPrice(treatments: Treatment[]): number {
    return treatments.reduce((sum, treatment) => sum + Number(treatment.price), 0);
  }

  private async sendAppointmentConfirmationMessage(phone: string, scheduledStart: Date, treatments: Treatment[]) {
    const params = generateParams(scheduledStart, treatments, "appointment_confirmation");
    const messageTemplate = messages["appointment_confirmation"];
    const formattedMessage = formatMessage(messageTemplate, params);

    await this.whatsAppService.sendInteractiveMessage(phone, formattedMessage);
  }
}