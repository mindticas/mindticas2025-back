import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Repository, In, MoreThan, Not } from 'typeorm';
import { Appointment, User, Customer, Treatment } from '../entities/';
import { AppointmentRegisterDto, CustomerRegisterDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../enums/appointments.status.enum';
import CustomerService from './customer.service';
import WhatsAppService from './whatsapp.service';
import * as messages from '../templates/whatsapp.messages.json';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { formatMessage, generateParams } from '../utils/messageFormatter';

@Injectable()
export default class AppointmentService implements OnModuleInit {
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
    private readonly schedulerRegistry: SchedulerRegistry,
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
      const savedAppointment = await this.appointmentRepository.save(
        appointment,
      );

      try {
        await this.sendAppointmentConfirmationMessage(
          customer.phone,
          scheduledStart,
          treatments,
        );
        this.scheduleReminderMessage(savedAppointment);
      } catch (error) {
        this.logger.error(`Error connecting to whapi: ${error.message}`);
      }

      return savedAppointment;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating appointment: ${error.message}`,
      );
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

  scheduleReminderMessage(appointment: Appointment) {
    try {
      const reminderTime = new Date(appointment.scheduled_start);
      reminderTime.setHours(reminderTime.getHours() - 12);

      const now = new Date();
      if (reminderTime <= now) {
        this.logger.log(
          `Appointment reminder time exceeded: ${appointment.id}.`,
        );
        return null;
      }

      const job = new CronJob(reminderTime, async () => {
        try {
          const currentAppointment = await this.appointmentRepository.findOne({
            where: { id: appointment.id },
            relations: ['customer'],
          });

          if (
            currentAppointment &&
            currentAppointment.status !== Status.CANCELED
          ) {
            const reminderText = messages['appointment_reminder'];
            await this.whatsAppService.sendInteractiveMessage(
              currentAppointment.customer.phone,
              reminderText,
              [WhatsAppService.CANCEL],
            );
            this.logger.log(`Reminder sent to appointment: ${appointment.id}`);
          }
        } catch (error) {
          this.logger.error(`Error sending reminder: ${error.message}`);
        }
      });

      const jobName = `reminder_${appointment.id}`;
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();

      this.logger.log(
        `Scheduled reminder, appointment: ${appointment.id}/${reminderTime}`,
      );
    } catch (error) {
      this.logger.error(`Error scheduling reminder: ${error.message}`);
    }
  }

  async onModuleInit() {
    try {
      const pendingAppointments = await this.appointmentRepository.find({
        where: {
          scheduled_start: MoreThan(new Date()),
          status: Not(Status.CANCELED),
        },
        relations: ['customer'],
      });

      this.logger.log(
        `Programming ${pendingAppointments.length} reminders at startup`,
      );

      for (const appointment of pendingAppointments) {
        this.scheduleReminderMessage(appointment);
      }
    } catch (error) {
      this.logger.error(`Error initializing reminders: ${error.message}`);
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

  private validateAppointment(start: Date): void {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    if (start > maxDate || start < today) {
      throw new BadRequestException(
        'Appointments must be scheduled within a range of the next 7 days.',
      );
    }
  }

  private async ensureNoExistingAppointment(
    scheduledStart: Date,
  ): Promise<void> {
    const existingAppointment = await this.appointmentRepository.findOne({
      where: { scheduled_start: scheduledStart },
    });

    if (!existingAppointment) {
      return null;
    }
    throw new BadRequestException(
      'An appointment is already scheduled at this time.',
    );
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
}
