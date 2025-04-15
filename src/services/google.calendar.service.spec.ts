import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleCalendarService } from './index';
import { Status } from '../enums/appointments.status.enum';
import { Appointment } from '../entities';

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;
  let mockConfigService: Partial<ConfigService>;
  let mockLogger: Partial<Logger>;
  let mockCalendar: any;

  const mockAppointment: Appointment = {
    id: 1,
    status: Status.PENDING,
    scheduled_start: new Date('2025-03-10T14:00:00Z'),
    total_price: 100.5,
    duration: 60,
    user: {
      id: 1,
      name: 'Doctor Example',
      email: 'peluquero@example.com',
    },
    customer: {
      id: 1,
      name: 'User name',
      phone: '3121112233',
    },
    treatments: [
      {
        id: 1,
        name: 'Haircut',
        price: 50,
        duration: 30,
        description: 'Standard haircut',
      },
    ],
  } as unknown as Appointment;

  beforeEach(async () => {
    mockCalendar = {
      events: {
        insert: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        const configs = {
          'google.clientId': 'mock-client-id',
          'google.clientSecret': 'mock-client-secret',
          'google.redirectURI': 'mock-redirect-uri',
          'google.refreshToken': 'mock-refresh-token',
        };
        return configs[key];
      }),
    };

    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
    };

    jest.spyOn(google.auth, 'OAuth2').mockImplementation(
      () =>
        ({
          setCredentials: jest.fn(),
        } as any),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleCalendarService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GoogleCalendarService>(GoogleCalendarService);

    (service as any).logger = mockLogger;

    (service as any).calendar = mockCalendar;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      mockCalendar.events.insert.mockResolvedValueOnce({
        data: { id: 'mockEventId' },
      });

      const result = await service.createEvent(mockAppointment);

      expect(result).toBe('mockEventId');
      expect(mockCalendar.events.insert).toHaveBeenCalledWith({
        calendarId: 'primary',
        requestBody: expect.objectContaining({
          summary: expect.any(String),
          description: expect.any(String),
          start: expect.objectContaining({
            dateTime: mockAppointment.scheduled_start,
            timeZone: 'America/Mexico_City',
          }),
          end: expect.objectContaining({
            dateTime: expect.any(Date),
            timeZone: 'America/Mexico_City',
          }),
          attendees: [{ email: mockAppointment.user.email }],
        }),
      });
    });

    it('should handle error when creating event fails', async () => {
      const errorMessage = 'Google Calendar error';
      mockCalendar.events.insert.mockRejectedValueOnce(new Error(errorMessage));

      await service.createEvent(mockAppointment);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`Google Calendar error: ${errorMessage}`),
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      const eventId = 'test-event-id';
      mockCalendar.events.delete.mockResolvedValueOnce({});

      await service.deleteEvent(eventId);

      expect(mockCalendar.events.delete).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: eventId,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Evento con ID ${eventId} eliminado correctamente.`,
      );
    });

    it('should handle error when deleting event fails', async () => {
      const eventId = 'test-event-id';
      const errorMessage = 'Delete event error';
      mockCalendar.events.delete.mockRejectedValueOnce(new Error(errorMessage));

      await service.deleteEvent(eventId);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error al eliminar el evento: ${errorMessage}`),
      );
    });
  });
});
