import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from './whatsapp.service';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(async () => {
    process.env.WHAAPI_URL = 'https://api.whatsapp.com';
    process.env.WHAAPI_TOKEN = 'test-token';
    process.env.WHAAPI_CHANNEL_ID = 'test-channel';

    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappService],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateEnvVariables', () => {
    it('should throw BadRequestException if WHAAPI_URL is missing', () => {
      process.env.WHAAPI_URL = '';
      expect(() => new WhatsappService()).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if WHAAPI_TOKEN is missing', () => {
      process.env.WHAAPI_TOKEN = '';
      expect(() => new WhatsappService()).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if WHAAPI_CHANNEL_ID is missing', () => {
      process.env.WHAAPI_CHANNEL_ID = '';
      expect(() => new WhatsappService()).toThrow(BadRequestException);
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const phone = '5551234567';
      const message = 'Hello, this is a test message';
      const mockResponse = { data: { success: true } };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.sendMessage(phone, message);
      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.WHAAPI_URL}/messages/text`,
        {
          to: `521${phone}@s.whatsapp.net`,
          channel: process.env.WHAAPI_CHANNEL_ID,
          body: message,
        },
        { headers: service['getHeaders']() }
      );
    });

    it('should handle errors properly', async () => {
      (axios.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: 'Request error' },
      });

      await expect(
        service.sendMessage('5551234567', 'Message'),
      ).rejects.toThrow(new HttpException('Request error', 400));
    });
  });

  describe('sendInteractiveMessage', () => {
    it('should send an interactive message successfully', async () => {
      const phone = '5551234567';
      const mockResponse = { data: { success: true } };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.sendInteractiveMessage(phone);
      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.WHAAPI_URL}/messages/interactive`,
        {
          to: `521${phone}@s.whatsapp.net`,
          channel: process.env.WHAAPI_CHANNEL_ID,
          type: 'button',
          body: { text: 'empty' },
          action: {
            buttons: [{ id: 'id', type: 'quick_reply', title: 'title' }],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHAAPI_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle errors in sendInteractiveMessage', async () => {
      (axios.post as jest.Mock).mockRejectedValue({
        response: { status: 500, data: 'Internal server error' },
      });

      await expect(
        service.sendInteractiveMessage('5551234567'),
      ).rejects.toThrow(
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
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
