import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import WhatsAppService from './whatsapp.service';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { of, throwError } from 'rxjs';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let httpService: HttpService;

  beforeEach(async () => {
    process.env.WHAAPI_URL = 'https://fake-api.com';
    process.env.WHAAPI_TOKEN = 'fake-token';
    process.env.WHAAPI_CHANNEL_ID = 'fake-channel';

    const mockHttpService = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const phone = '5551234567';
      const message = 'Hello, this is a test message';

      // Mocking a full AxiosResponse
      const mockResponse: AxiosResponse<any, any> = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'post').mockReturnValueOnce(of(mockResponse));

      const result = await service.sendMessage(phone, message);
      expect(result).toEqual({ success: true });
    });

    it('should handle errors properly', async () => {
      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        throwError(() => ({
          response: {
            status: 400,
            data: 'Invalid request',
          },
        }))
      );

      await expect(
        service.sendMessage('5551234567', 'Test Message'),
      ).rejects.toThrow(new HttpException('Invalid request', 400));
    });
  });

  describe('sendInteractiveMessage', () => {
    it('should send an interactive message successfully', async () => {
      const phone = '5551234567';
      const message = 'Confirm your appointment';

      const mockResponse: AxiosResponse<any, any> = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'post').mockReturnValueOnce(of(mockResponse));

      const result = await service.sendInteractiveMessage(phone, message);
      expect(result).toEqual({ success: true });
    });

    it('should handle errors in sendInteractiveMessage', async () => {
      jest.spyOn(httpService, 'post').mockReturnValueOnce(
        throwError(() => ({
          response: { status: 500, data: 'Internal Server Error' },
        }))
      );

      await expect(
        service.sendInteractiveMessage('5551234567', 'Test'),
      ).rejects.toThrow(
        new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('validateEnvVariables', () => {
    it('should throw BadRequestException if WHAAPI_URL is missing', () => {
      process.env.WHAAPI_URL = '';
      expect(() => new WhatsAppService(httpService)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if WHAAPI_TOKEN is missing', () => {
      process.env.WHAAPI_TOKEN = '';
      expect(() => new WhatsAppService(httpService)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if WHAAPI_CHANNEL_ID is missing', () => {
      process.env.WHAAPI_CHANNEL_ID = '';
      expect(() => new WhatsAppService(httpService)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('handleError', () => {
    it('should throw HttpException with the correct error message', () => {
      const error = {
        response: {
          status: 404,
          data: 'Not found',
        },
      };

      expect(() => service['handleError'](error)).toThrow(
        new HttpException('Not found', 404),
      );
    });

    it('should handle unexpected errors properly', () => {
      const error = new Error('Unexpected error');
      expect(() => service['handleError'](error)).toThrow(
        new HttpException(
          'Error sending message',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
