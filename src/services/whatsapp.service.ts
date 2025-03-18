import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
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

@Injectable()
export default class WhatsAppService {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly channelId: string;
  private readonly logger = new Logger(WhatsAppService.name);
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => AppointmentService))
    private readonly appointmentService: AppointmentService,
  ) {
    this.apiUrl = process.env.WHAAPI_URL || '';
    this.token = process.env.WHAAPI_TOKEN || '';
    this.channelId = process.env.WHAAPI_CHANNEL_ID || '';
    this.validateEnvVariables();
  }

  async sendMessage(phone: string, message: string): Promise<any> {
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
      return response.data;
    } catch (error) {
      this.logger.error(`Error al enviar el mensaje: ${error.message}`);
      this.handleError(error);
    }
  }

  async sendInteractiveMessage(phone: string, message: string): Promise<any> {
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
          buttons: [
            {
              id: '1',
              type: 'quick_reply',
              title: '\u2705 Confirmar',
            },
          ],
        },
      };
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/messages/interactive`, data, {
          headers: this.getHeaders(),
        }),
      );
      this.logger.log(`Enviando payload: ${JSON.stringify(data)}`);
      return response.data;
    } catch (error) {
      console.error(
        'Error sending interactive message:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data || 'Error sending interactive message:',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sentACK(messageId: string) {
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
  }

  async handleWebhook(body: any): Promise<any> {
    const { messages } = body;
    if (!messages) return;
    const { id, type, from, reply } = messages[0];
    this.sentACK(id);
    if (type !== 'reply' || !reply?.buttons_reply?.id) return;
    const numberRaw = from.slice(-10);
    const buttonId = reply.buttons_reply.id;
    if (buttonId === 'ButtonsV3:1') {
      const lastAppointment =
        await this.appointmentService.getLastAppointmentByPhone(numberRaw);
      if (!lastAppointment) {
        console.error('Appointment not found');
        return;
      }
      await this.appointmentService.updateStatus(
        lastAppointment.id,
        Status.CONFIRMED,
      );
      const params = generateParams(
        lastAppointment.scheduled_start,
        lastAppointment.treatments,
        'appointment_confirmed',
      );
      const formattedMessage = formatMessage(
        messagesTemplate['appointment_confirmed'],
        params,
      );
      return this.sendMessage(numberRaw, formattedMessage);
    }
    if (buttonId === 'ButtonsV3:2') {
      return this.sendMessage(numberRaw, messages['appointment_canceled']);
    }
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
      throw new BadRequestException('Invalid Api url');
    } else if (!this.token) {
      throw new BadRequestException('Invalid Token');
    } else if (!this.channelId) {
      throw new BadRequestException('Invalid Channel Id');
    }
  }
}
