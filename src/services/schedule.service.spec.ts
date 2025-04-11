import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedue.service';
import { Schedule } from '../entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let repository: Repository<Schedule>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    repository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new schedule', async () => {
      const scheduleDto = [
        {
          day: 'Lunes',
          open_hours: ['10:00', '11:00'],
        },
      ];
      const createdSchedule = [
        {
          id: 1,
          day: 'Lunes',
          open_hours: ['10:00', '11:00'],
        },
      ];

      repository.findOne = jest.fn().mockResolvedValue(null);
      repository.create = jest.fn().mockReturnValue(createdSchedule);
      repository.save = jest.fn().mockResolvedValue(createdSchedule);

      const result = await service.create(scheduleDto);

      expect(result).toEqual(createdSchedule);
      expect(repository.create).toHaveBeenCalledWith(scheduleDto);
      expect(repository.save).toHaveBeenCalledWith(createdSchedule);
    });

    it('should throw ConflictException if schedule for the day exists', async () => {
      const scheduleDto = [
        {
          day: 'Lunes',
          open_hours: ['10:00', '11:00'],
        },
      ];

      repository.findOne = jest.fn().mockResolvedValue({
        id: 1,
        day: 'Lunes',
        open_hours: ['10:00', '11:00'],
      });

      await expect(service.create(scheduleDto)).rejects.toThrowError(
        new ConflictException('A schedule for this day already exists'),
      );
    });
  });

  describe('update', () => {
    it('should update the schedule', async () => {
      const updatedSchedule = {
        id: 1,
        day: 'Lunes',
        open_hours: ['10:00', '11:00', '12:00'],
      };

      const scheduleDto = {
        open_hours: ['10:00', '11:00', '12:00'],
      };

      repository.findOneBy = jest.fn().mockResolvedValue(updatedSchedule);
      repository.save = jest.fn().mockResolvedValue(updatedSchedule);

      const result = await service.update(1, scheduleDto);

      expect(result).toEqual(updatedSchedule);
      expect(repository.save).toHaveBeenCalledWith(updatedSchedule);
    });

    it('should throw BadRequestException if schedule does not exist', async () => {
      const scheduleDto = {
        open_hours: ['10:00', '11:00', '12:00'],
      };

      repository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.update(1, scheduleDto)).rejects.toThrowError(
        new BadRequestException('Schedule not found'),
      );
    });
  });

  describe('delete', () => {
    it('should delete the schedule', async () => {
      const scheduleToDelete = {
        id: 1,
        day: 'Lunes',
        open_hours: ['10:00', '11:00'],
      };

      repository.findOneBy = jest.fn().mockResolvedValue(scheduleToDelete);
      repository.remove = jest.fn().mockResolvedValue(undefined);

      await service.delete(1);

      expect(repository.remove).toHaveBeenCalledWith(scheduleToDelete);
    });

    it('should throw BadRequestException if schedule does not exist', async () => {
      repository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrowError(
        new BadRequestException('Schedule not found'),
      );
    });
  });
});
