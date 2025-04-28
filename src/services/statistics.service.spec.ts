import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import StatisticsService from './statistics.service';
import { Appointment, Treatment } from '../entities';
import { ResponseStatisticsDto } from '../dtos';
import * as ExcelJS from 'exceljs';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let appointmentRepository: Repository<Appointment>;
  let treatmentRepository: Repository<Treatment>;
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
        {
          provide: getRepositoryToken(Treatment),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    appointmentRepository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );
    treatmentRepository = module.get<Repository<Treatment>>(
      getRepositoryToken(Treatment),
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

  describe('getAllTreatments', () => {
    it('should return an array of treatment names', async () => {
      const treatmentsMock = [
        { id: 1, name: 'Corte Regular' },
        { id: 2, name: 'Tinte' },
        { id: 3, name: 'Manicure' },
      ];
      jest
        .spyOn(treatmentRepository, 'find')
        .mockResolvedValue(treatmentsMock as Treatment[]);

      const result = await (service as any).getAllTreatments();

      expect(result).toEqual(['Corte Regular', 'Tinte', 'Manicure']);
      expect(treatmentRepository.find).toHaveBeenCalledWith({
        select: ['name'],
        order: { name: 'ASC' },
      });
    });
  });

  describe('exportStatisticsToExcel', () => {
    it('should throw a BadRequestException if startDate or endDate are empty', async () => {
      await expect(service.exportStatisticsToExcel('', '')).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.exportStatisticsToExcel(null, '2025-01-31'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.exportStatisticsToExcel('2025-01-01', null),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate an Excel buffer with statistics for all treatments', async () => {
      const treatmentsMock = [
        { id: 1, name: 'Corte Regular' },
        { id: 2, name: 'Tinte' },
      ];

      jest
        .spyOn(treatmentRepository, 'find')
        .mockResolvedValue(treatmentsMock as Treatment[]);

      const getStatisticsMock = jest.spyOn(service, 'getStatistics');

      getStatisticsMock.mockImplementation((start, end, treatment) => {
        const dto = new ResponseStatisticsDto();

        if (treatment === 'Corte Regular') {
          dto.totalEarnings = '300';
          dto.totalServices = '5';
          dto.totalCompletedAppointments = '4';
          dto.totalCanceledAppointments = '1';
        } else if (treatment === 'Tinte') {
          dto.totalEarnings = '200';
          dto.totalServices = '3';
          dto.totalCompletedAppointments = '2';
          dto.totalCanceledAppointments = '1';
        } else {
          dto.totalEarnings = '500';
          dto.totalServices = '8';
          dto.totalCompletedAppointments = '6';
          dto.totalCanceledAppointments = '2';
        }

        return Promise.resolve(dto);
      });

      const mockWorksheet = {
        columns: [],
        addRow: jest.fn(),
        getRow: jest.fn().mockReturnValue({
          getCell: jest.fn().mockReturnValue({ fill: {} }),
        }),
      };

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
        xlsx: {
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
        },
      };

      jest
        .spyOn(ExcelJS, 'Workbook')
        .mockImplementation(() => mockWorkbook as any);

      const result = await service.exportStatisticsToExcel(
        '2025-01-01',
        '2025-06-30',
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(treatmentRepository.find).toHaveBeenCalled();
      expect(service.getStatistics).toHaveBeenCalledTimes(3);
      expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    });
  });
});
