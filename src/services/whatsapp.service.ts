import { HttpService } from '@nestjs/axios';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import AppointmentService from './appointment.service';
import { formatMessage, generateParams } from '../utils/messageFormatter';
import * as messagesTemplate from '../templates/whatsapp.messages.json';
import { Status } from '../enums/appointments.status.enum';
import { AppointmentResponseDto } from '../dtos';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class WhatsAppService {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly channelId: string;
  private readonly logger = new Logger(WhatsAppService.name);
  public static readonly CONFIRM = {
    id: '1',
    type: 'quick_reply',
    title: '\u2705 Confirmar cita',
  };
  public static readonly CANCEL = {
    id: '2',
    type: 'quick_reply',
    title: '\u274C Cancelar cita',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AppointmentService))
    private readonly appointmentService: AppointmentService,
  ) {
    this.apiUrl = process.env.WHAAPI_URL || '';
    this.token = process.env.WHAAPI_TOKEN || '';
    this.channelId = process.env.WHAAPI_CHANNEL_ID || '';
    this.validateEnvVariables();
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const phoneF = `521${phone}@s.whatsapp.net`;
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/messages/text`,
          {
            to: phoneF,
            channel: this.channelId,
            body: message,
          },
          {
            headers: this.getHeaders(),
          },
        ),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Error sending simple message: ${error.message}`);
      this.handleError(error);
    }
  }

  async sendInteractiveMessage(
    phone: string,
    message: string,
    buttons: { id: string; type: string; title: string }[],
  ): Promise<boolean> {
    try {
      const formattedPhone = `521${phone}@s.whatsapp.net`;
      const data = {
        to: formattedPhone,
        channel: this.channelId,
        type: 'button',
        body: {
          text: message,
        },
        action: {
          buttons: buttons,
        },
      };
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/messages/interactive`, data, {
          headers: this.getHeaders(),
        }),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Error sending interactive message: ${error.message}`);
      return false;
    }
  }

  async sentACK(messageId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.apiUrl}/messages/${messageId}`,
          {},
          {
            headers: this.getHeaders(),
          },
        ),
      );
      return response;
    } catch (error) {
      this.logger.warn(`ACK(seen) NOT SENT: ${error.message}`);
    }
  }

  async handleWebhook(payload: any): Promise<any> {
    if (
      !payload ||
      !payload.messages ||
      !Array.isArray(payload.messages) ||
      payload.messages.length === 0
    ) {
      return;
    }
    const { id, type, from, reply, context } = payload.messages[0];

    if (!id || !from) {
      this.logger.warn('Missing required fields in message');
      return;
    }
    let appointmentId;
    const quotedBody = context?.quoted_content?.body;
    if (quotedBody) {
      const idMatch = quotedBody.match(/ID:?\s*(\d+)/);
      if (idMatch && idMatch[1]) {
        appointmentId = idMatch[1];
      }
    }

    if (quotedBody && !appointmentId) {
      return;
    }

    if (type !== 'reply' || !reply?.buttons_reply?.id) {
      return;
    }

    await this.sentACK(id);
    const numberRaw = from.slice(-10);
    const buttonId = reply.buttons_reply.id;

    const appointment = await this.appointmentService.getById(appointmentId);
    if (!appointment) {
      this.logger.error(`Appointment with ID ${appointmentId} not found.`);
      return;
    }

    if (buttonId === 'ButtonsV3:1') {
      return this.handleAppointmentStatusChange(
        appointment,
        numberRaw,
        'confirmed',
      );
    } else if (buttonId === 'ButtonsV3:2') {
      return this.handleAppointmentStatusChange(
        appointment,
        numberRaw,
        'canceled',
      );
    } else {
      this.logger.error(`Unknown button ID: ${buttonId}`);
      return;
    }
  }

  private async handleAppointmentStatusChange(
    appointment: AppointmentResponseDto,
    phoneNumber: string,
    status: 'confirmed' | 'canceled',
  ): Promise<any> {
    const statusEnum =
      status === 'confirmed' ? Status.CONFIRMED : Status.CANCELED;

    await this.appointmentService.updateStatus(appointment.id, statusEnum);
    const messageKey = `appointment_${status}`;
    const params = generateParams(
      appointment.scheduled_start,
      appointment.treatments,
      messageKey,
      this.configService,
    );
    const formattedMessage = formatMessage(
      messagesTemplate[messageKey],
      params,
    );
    return this.sendMessage(phoneNumber, formattedMessage);
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  private handleError(error: any): void {
    if (error.response) {
      console.error(`Error ${error.response.status}:`, error.response.data);
      throw new HttpException(error.response.data, error.response.status);
    } else {
      console.error('Error inesperado:', error.message);
      throw new HttpException(
        'Error sending message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateEnvVariables(): void {
    if (!this.apiUrl) {
      this.logger.error('Invalid Api url');
    }
    if (!this.token) {
      this.logger.error('Invalid Token');
    }
    if (!this.channelId) {
      this.logger.error('Invalid Channel Id');
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/health`, {
          headers: this.getHeaders(),
          params: {
            wakeup: true,
            channel_type: 'web',
          },
        }),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error('Unable to connect to WHAPI: ', error.message);
      return false;
    }
  }
}
