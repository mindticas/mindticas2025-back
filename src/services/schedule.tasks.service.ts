import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Not } from 'typeorm';
import { Appointment } from '../entities/index';
import { Status } from '../enums/appointments.status.enum';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GoogleCalendarService, WhatsAppService } from './index';
import * as messages from '../templates/whatsapp.messages.json';

@Injectable()
export default class ScheduleTasksService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleTasksService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => WhatsAppService))
    private readonly whatsAppService: WhatsAppService,
    @Inject(forwardRef(() => GoogleCalendarService))
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async onModuleInit() {
    try {
      const isConnected = await this.whatsAppService.isConnected();

      if (!isConnected) {
        this.logger.warn(
          'WHAPI is unavailable. No reminders have been scheduled.',
        );
        return;
      }

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
        if (
          appointment.status !== Status.CANCELED &&
          appointment.status !== Status.COMPLETED
        ) {
          this.scheduleReminderMessage(appointment);
        }
      }
    } catch (error) {
      this.logger.error(`Error initializing reminders: ${error.message}`);
    }
  }

  scheduleReminderMessage(appointment: Appointment) {
    try {
      const reminderTime = new Date(appointment.scheduled_start);
      reminderTime.setHours(reminderTime.getHours() - 12);

      if (reminderTime <= new Date()) {
        this.logger.log(
          `Appointment reminder time exceeded: ${appointment.id}.`,
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
            const sent = await this.whatsAppService.sendInteractiveMessage(
              currentAppointment.customer.phone,
              reminderText,
              [WhatsAppService.CANCEL],
            );
            if (sent) {
              this.logger.log(
                `Reminder sent to appointment: ${appointment.id}`,
              );
            }
          }
        } catch (error) {
          this.logger.error(`Error sending reminder: ${error.message}`);
        }
      });

      const jobName = `reminder_${appointment.id}`;
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();

      this.logger.log(
        `Scheduled reminder, appointment: id(${appointment.id}) / ${reminderTime}`,
      );
    } catch (error) {
      this.logger.error(`Error scheduling reminder: ${error.message}`);
    }
  }

  scheduleCancellation(appointment: Appointment) {
    try {
      const cancelTime = new Date(appointment.created_at);
      cancelTime.setHours(cancelTime.getHours() + 1);

      if (cancelTime <= new Date()) {
        this.logger.log(
          `Cancellation time already passed for appointment: ${appointment.id}.`,
        );
        return;
      }

      const job = new CronJob(cancelTime, async () => {
        try {
          const currentAppointment = await this.appointmentRepository.findOne({
            where: { id: appointment.id },
          });

          if (
            currentAppointment &&
            currentAppointment.status === Status.PENDING
          ) {
            currentAppointment.status = Status.CANCELED;
            await this.appointmentRepository.save(currentAppointment);
            if (currentAppointment.eventId) {
              await this.googleCalendarService.deleteEvent(appointment.eventId);
            }
            this.logger.log(
              `Appointment ${appointment.id} has been canceled due to no confirmation.`,
            );
          } else {
            this.scheduleReminderMessage(appointment);
          }
        } catch (error) {
          this.logger.error(`Error canceling appointment: ${error.message}`);
        }
      });

      const jobName = `cancel_${appointment.id}`;
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();

      this.logger.log(
        `Scheduled cancellation for appointment: ${appointment.id} at ${cancelTime}`,
      );
    } catch (error) {
      this.logger.error(`Error scheduling cancellation: ${error.message}`);
    }
  }
}
