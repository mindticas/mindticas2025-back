import {
  BadRequestException,
  forwardRef,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Appointment, User, Customer, Treatment } from '../entities/';
import {
  AppointmentRegisterDto,
  CustomerRegisterDto,
  AppointmentUpdateDto,
} from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../enums/appointments.status.enum';
import CustomerService from './customer.service';
import WhatsAppService from './whatsapp.service';
import * as messages from '../templates/whatsapp.messages.json';
import { formatMessage, generateParams } from '../utils/messageFormatter';
import GoogleCalendarService from './google.calendar.service';
import {
  validateAppointment,
  existingAppointment,
} from '../utils/appointment.validations';
import ScheduleTasksService from './schedule.tasks.service';

@Injectable()
export default class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
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
    @Inject(forwardRef(() => ScheduleTasksService))
    private readonly scheduleTasksService: ScheduleTasksService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  get(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: { customer: true, treatments: true },
    });
  }

  async getById(id: number): Promise<Appointment> {
    const appointment = await this.searchForId(id);
    return appointment;
  }

  async create(createDto: AppointmentRegisterDto): Promise<Appointment> {
    const user = await this.getUser();
    const treatments = await this.getTreatments(createDto.treatment_ids);
    const serviceDuration = this.calculateServiceDuration(treatments);
    const scheduledStart = new Date(createDto.scheduled_start);

    if (await existingAppointment(scheduledStart, this.appointmentRepository)) {
      throw new BadRequestException(
        'Ya hay una cita agendada en esta horario.',
      );
    }

    await validateAppointment(scheduledStart);

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
    const eventId = await this.googleCalendarService.createEvent(appointment);
    appointment.eventId = eventId;
    let savedAppointment;

    try {
      savedAppointment = await this.appointmentRepository.save(appointment);
    } catch (error) {
      this.logger.error(
        `Error saving appointment: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error creating appointment: ${error.message}`,
      );
    }

    this.sendAppointmentConfirmationMessage(
      customer.phone,
      scheduledStart,
      treatments,
    );
    this.scheduleTasksService.scheduleCancellation(savedAppointment);

    return savedAppointment;
  }

  async update(
    id: number,
    updateDto: AppointmentUpdateDto,
  ): Promise<Appointment> {
    const appointment = await this.searchForId(id);

    if (updateDto.scheduled_start) {
      const scheduledStart = new Date(updateDto.scheduled_start);
      if (isNaN(scheduledStart.getTime())) {
        throw new BadRequestException(
          'Invalid date format for scheduled_start',
        );
      }

      if (
        await existingAppointment(scheduledStart, this.appointmentRepository)
      ) {
        throw new BadRequestException(
          'Ya hay una cita agendada en este horario.',
        );
      }

      await validateAppointment(scheduledStart);

      appointment.scheduled_start = scheduledStart;
    }

    if (updateDto.customer_name) {
      appointment.customer.name = updateDto.customer_name;
      await this.customerRepository.save(appointment.customer);
    }

    if (updateDto.treatments_id && Array.isArray(updateDto.treatments_id)) {
      const treatments = await this.treatmentRepository.find({
        where: { id: In(updateDto.treatments_id) },
      });

      let notFoundTreatmentIds: number[] = [];

      notFoundTreatmentIds = updateDto.treatments_id.filter(
        (id) => !treatments.some((treatment) => treatment.id === id),
      );

      if (notFoundTreatmentIds.length > 0) {
        throw new NotFoundException(
          `Error updating treatments: Treatments with IDs ${notFoundTreatmentIds.join(
            ', ',
          )} not found`,
        );
      }

      appointment.treatments = treatments;
    }

    Object.assign(appointment, updateDto);
    if (updateDto.customer_name) {
      appointment.customer.name = updateDto.customer_name;
      appointment.customer = { ...appointment.customer };
    }

    try {
      const app = await this.appointmentRepository.save(appointment);
      return app;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update appointment`);
    }
  }

  async delete(id: number): Promise<Appointment> {
    const appointment = await this.searchForId(id);
    if (appointment) {
      try {
        if (appointment.eventId) {
          this.googleCalendarService.deleteEvent(appointment.eventId);
        }
        return this.appointmentRepository.remove(appointment);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to delete appointment`);
      }
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
      throw new BadRequestException(
        `Error getting the last appointment: ${error.message}`,
      );
    }
  }

  async updateStatus(appointmentId: number, status: Status) {
    const appointment = await this.appointmentRepository.findOneBy({
      id: appointmentId,
    });
    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID: ${appointmentId} not found`,
      );
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
    const duration = treatments.reduce(
      (sum, treatment) => sum + Number(treatment.duration),
      0,
    );
    if (!duration) throw new BadRequestException('Service duration not found');
    return duration;
  }

  private async getOrCreateCustomer(
    createDto: AppointmentRegisterDto,
  ): Promise<Customer> {
    let customer = await this.customerRepository.findOne({
      where: { phone: createDto.phone },
    });

    if (!customer) {
      const customerDto = new CustomerRegisterDto();
      customerDto.name = createDto.name;
      customerDto.phone = createDto.phone;
      customer = await this.customerService.createCustomer(customerDto);
    }
    return customer;
  }

  private calculateTotalPrice(treatments: Treatment[]): number {
    return treatments.reduce(
      (sum, treatment) => sum + Number(treatment.price),
      0,
    );
  }

  private async sendAppointmentConfirmationMessage(
    phone: string,
    scheduledStart: Date,
    treatments: Treatment[],
  ) {
    const params = generateParams(
      scheduledStart,
      treatments,
      'appointment_confirmation',
    );
    const messageTemplate = messages['appointment_confirmation'];
    const formattedMessage = formatMessage(messageTemplate, params);

    await this.whatsAppService.sendInteractiveMessage(phone, formattedMessage, [
      WhatsAppService.CONFIRM,
    ]);
  }

  async searchForId(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['customer', 'treatments'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID: ${id} not found`);
    }
    return appointment;
  }
}
