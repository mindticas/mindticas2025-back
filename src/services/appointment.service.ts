import {
  BadRequestException,
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

    const scheduledStart = new Date(createDto.scheduled_start);

    this.existingAppointment(scheduledStart);

    this.appointmentValidation(scheduledStart);

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

    try {
      const saved = await this.appointmentRepository.save(appointment);

      try {
        const messageText = messages['appointment_confirmation'];
        await this.whatsAppService.sendInteractiveMessage(
          customer.phone,
          messageText,
          [WhatsAppService.CONFIRM],
        );

        this.scheduleReminderMessage(saved);
      } catch (error) {
        this.logger.error(`Error al conectar con whapi: ${error.message}`);
      }

      return saved;
    } catch (error) {
      throw new BadRequestException(
        `Error creating appointment: ${error.message}`,
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
          `Tiempo excedido para el recordatorio de la cita: ${appointment.id}.`,
        );
        return;
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
            this.logger.log(`Recordatorio enviado a cita: ${appointment.id}`);
          }
        } catch (error) {
          this.logger.error(`Error al enviar recordatorio: ${error.message}`);
        }
      });

      const jobName = `reminder_${appointment.id}`;
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();

      this.logger.log(
        `Recordatorio programado, cita: ${appointment.id}/${reminderTime}`,
      );
    } catch (error) {
      this.logger.error(`Error al programar recordatorio: ${error.message}`);
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
        `Programando ${pendingAppointments.length} recordatorios al iniciar`,
      );

      for (const appointment of pendingAppointments) {
        this.scheduleReminderMessage(appointment);
      }
    } catch (error) {
      this.logger.error(`Error al inicializar recordatorios: ${error.message}`);
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

  private async existingAppointment(scheduledStart) {
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
  }

  private appointmentValidation(start: Date): void {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    if (start > maxDate || start < today) {
      throw new BadRequestException(
        'Appointments must be scheduled within a range of the next 7 days.',
      );
    }
  }
}
