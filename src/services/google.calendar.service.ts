import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../entities';
import GoogleTokenService from './google-token.service';

@Injectable()
export default class GoogleCalendarService {
  private oAuth2Client;
  private calendar;
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly googleTokenService: GoogleTokenService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      this.configService.get('google.clientId'),
      this.configService.get('google.clientSecret'),
      this.configService.get('google.redirectURI'),
    );
  }

  private async ensureAuth() {
    if (!this.oAuth2Client.credentials.refresh_token) {
      const refreshToken = await this.googleTokenService.getToken(
        'Elegangsters Barbershop',
      );
      if (!refreshToken) {
        this.logger.warn(
          'No refresh token found. Google Calendar API not authenticated.',
        );
        return;
      }
      this.oAuth2Client.setCredentials({ refresh_token: refreshToken });
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.oAuth2Client,
      });
    }
  }

  async createEvent(savdAppt: Appointment) {
    await this.ensureAuth();
    const calendarEvent = {
      summary: `Cita para: ${
        savdAppt.treatments.length === 1
          ? savdAppt.treatments[0].name
          : savdAppt.treatments.map((t) => t.name).join(', ')
      }`,
      description: `Cita realizada por: ${JSON.stringify(
        savdAppt.customer.name,
      )}`,
      start: {
        dateTime: savdAppt.scheduled_start,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: new Date(
          savdAppt.scheduled_start.getTime() + savdAppt.duration * 60000,
        ),
        timeZone: 'America/Mexico_City',
      },
      attendees: [savdAppt.user.email].map((email) => ({ email })),
      reminders: {
        useDefault: true,
      },
    };

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      });
      return response.data.id;
    } catch (error) {
      this.logger.error(`Google Calendar error: ${error.message}`);
      return null;
    }
  }

  async deleteEvent(eventId: string) {
    await this.ensureAuth();
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      this.logger.log(`Event ID ${eventId} successfully deleted.`);
    } catch (error) {
      this.logger.error(`Error deleting event: ${error.message}`);
    }
  }

  getAuthUrl(): string {
    try {
      const scope = this.configService.get('google.googleScope');
      if (!scope) {
        throw new InternalServerErrorException(
          'Google Scope is not configured.',
        );
      }

      return this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [scope],
        prompt: 'consent',
      });
    } catch (error) {
      this.logger.error(`Error generating auth URL: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRefreshToken(code: string): Promise<string> {
    if (!code) {
      throw new BadRequestException('Authorization code is required.');
    }

    const { tokens } = await this.oAuth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new InternalServerErrorException(
        'No refresh token received. Try revoking access and authorizing again.',
      );
    }

    return tokens.refresh_token;
  }
}
