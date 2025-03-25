import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../entities';

@Injectable()
export default class GoogleCalendarService {
  private oAuth2Client;
  private calendar;
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private configService: ConfigService) {
    this.oAuth2Client = new google.auth.OAuth2(
      this.configService.get('google.clientId'),
      this.configService.get('google.clientSecret'),
      this.configService.get('google.redirectURI'),
    );

    this.oAuth2Client.setCredentials({
      refresh_token: this.configService.get('google.refreshToken'),
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
  }

  async createEvent(savdAppt: Appointment) {
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
    }
  }

  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      this.logger.log(`Evento con ID ${eventId} eliminado correctamente.`);
    } catch (error) {
      this.logger.error(`Error al eliminar el evento: ${error.message}`);
    }
  }
}
