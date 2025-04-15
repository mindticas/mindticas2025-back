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
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
    await expect(service.getStatistics(null, '2025-01-31')).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.getStatistics('2025-01-01', null)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return 0 if there are no matches', async () => {
    mockQueryBuilder.getRawOne
      .mockResolvedValueOnce({ totalearnings: 0 })
      .mockResolvedValueOnce({ totalservices: 0 })
      .mockResolvedValueOnce({ totalcompletedappointments: 0 })
      .mockResolvedValueOnce({ totalcanceledappointments: 0 });

    const result = await service.getStatistics('2025-01-01', '2025-01-31');

    expect(result).toEqual(
      Object.assign(new ResponseStatisticsDto(), {
        totalEarnings: 0,
        totalServices: 0,
        totalCompletedAppointments: 0,
        totalCanceledAppointments: 0,
      }),
    );
  });

  it('should return statistics correctly', async () => {
    mockQueryBuilder.getRawOne
      .mockResolvedValueOnce({ totalearnings: 500 })
      .mockResolvedValueOnce({ totalservices: 10 })
      .mockResolvedValueOnce({ totalcompletedappointments: 8 })
      .mockResolvedValueOnce({ totalcanceledappointments: 2 });

    const result = await service.getStatistics('2025-01-01', '2025-01-31');

    expect(result).toEqual(
      Object.assign(new ResponseStatisticsDto(), {
        totalEarnings: 500,
        totalServices: 10,
        totalCompletedAppointments: 8,
        totalCanceledAppointments: 2,
      }),
    );

    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'DATE(appointment.scheduled_start) BETWEEN :startDate AND :endDate',
      { startDate: '2025-01-01', endDate: '2025-01-31' },
    );
  });

  it('should apply the treatment filter correctly', async () => {
    mockQueryBuilder.getRawOne
      .mockResolvedValueOnce({ totalearnings: 200 })
      .mockResolvedValueOnce({ totalservices: 5 })
      .mockResolvedValueOnce({ totalcompletedappointments: 4 })
      .mockResolvedValueOnce({ totalcanceledappointments: 1 });

    const result = await service.getStatistics(
      '2025-01-01',
      '2025-01-31',
      'Corte Regular',
    );

    expect(result).toEqual(
      Object.assign(new ResponseStatisticsDto(), {
        totalEarnings: 200,
        totalServices: 5,
        totalCompletedAppointments: 4,
        totalCanceledAppointments: 1,
      }),
    );

    expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
      'appointment.treatments',
      'treatment',
      'treatment.name = :treatment',
      { treatment: 'Corte Regular' },
    );
  });
});
