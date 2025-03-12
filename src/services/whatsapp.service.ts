import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly channelId: string;

  constructor() {
    this.apiUrl = process.env.WHAAPI_URL || '';
    this.token = process.env.WHAAPI_TOKEN || '';
    this.channelId = process.env.WHAAPI_CHANNEL_ID || '';

    this.validateEnvVariables();
  }

  async sendMessage(phone: string, message: string): Promise<any> {
    try {
      const phoneF = `521${phone}@s.whatsapp.net`;

      const response = await axios.post(
        `${this.apiUrl}/messages/text`,
        {
          to: phoneF,
          channel: this.channelId,
          body: message,
        },
        {
          headers: this.getHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendInteractiveMessage(phone: string): Promise<any> {
    try {
      const formattedPhone = `521${phone}@s.whatsapp.net`;
      const data = {
        to: formattedPhone,
        channel: this.channelId,
        type: 'button',
        body: {
          text: 'empty',
        },
        action: {
          buttons: [
            {
              id: 'id',
              type: 'quick_reply',
              title: 'title',
            },
          ],
        },
      };

      const response = await axios.post(`${this.apiUrl}/messages/interactive`, data, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
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
      throw new HttpException('Error sending message', HttpStatus.INTERNAL_SERVER_ERROR);
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
