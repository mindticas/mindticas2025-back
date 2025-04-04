import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import StatisticsService from './statistics.service';
import { Appointment } from '../entities';
import { ResponseStatisticsDto } from '../dtos';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let appointmentRepository: Repository<Appointment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    appointmentRepository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );
  });

  it('should throw a BadRequestException if startDate or endDate are empty', async () => {
    await expect(service.getStatistics('', '')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return statistics correctly', async () => {
    const mockQueryBuilder =
      appointmentRepository.createQueryBuilder as jest.Mock;
    mockQueryBuilder().getRawOne.mockResolvedValue({
      totalearnings: 500,
      totalservices: 10,
      totalcompletedappointments: 8,
      totalcanceledappointments: 2,
    });

    const result = await service.getStatistics('2024-01-01', '2024-01-31');

    expect(result).toEqual(
      Object.assign(new ResponseStatisticsDto(), {
        totalEarnings: 500,
        totalServices: 10,
        totalCompletedAppointments: 8,
        totalCanceledAppointments: 2,
      }),
    );
  });

  it('should apply the treatment filter correctly', async () => {
    const mockQueryBuilder =
      appointmentRepository.createQueryBuilder as jest.Mock;
    mockQueryBuilder().getRawOne.mockResolvedValue({
      totalearnings: 200,
      totalservices: 5,
      totalcompletedappointments: 4,
      totalcanceledappointments: 1,
    });

    const result = await service.getStatistics(
      '2024-01-01',
      '2024-01-31',
      'Masaje',
    );
    expect(result).toEqual(
      Object.assign(new ResponseStatisticsDto(), {
        totalEarnings: 200,
        totalServices: 5,
        totalCompletedAppointments: 4,
        totalCanceledAppointments: 1,
      }),
    );
  });
});
