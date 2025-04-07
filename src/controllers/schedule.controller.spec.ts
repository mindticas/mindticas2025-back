import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from '../services/schedue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Schedule } from '../entities';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;
  let repository: Repository<Schedule>;

  const mockScheduleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn().mockResolvedValue({ userId: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockScheduleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);
    repository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of schedules', async () => {
    const result = [{ day: 'Lunes', open_hours: ['10:00', '11:00'] }];
    mockScheduleRepository.find.mockResolvedValue(result);

    expect(await controller.get()).toEqual(result);
  });

  it('should create schedules successfully', async () => {
    const createDto = [{ day: 'Lunes', open_hours: ['10:00', '11:00'] }];
    const result = [{ id: 1, day: 'Lunes', open_hours: ['10:00', '11:00'] }];
    mockScheduleRepository.create.mockReturnValue(result[0]);
    mockScheduleRepository.save.mockResolvedValue(result);

    expect(await controller.create(createDto)).toEqual(result);
  });

  it('should throw ConflictException if schedule for the day exists', async () => {
    const createDto = [{ day: 'Lunes', open_hours: ['10:00', '11:00'] }];
    mockScheduleRepository.findOne.mockResolvedValue({ day: 'Lunes' });

    await expect(controller.create(createDto)).rejects.toThrowError(
      'A schedule for this day already exists',
    );
  });

  it('should update the schedule successfully', async () => {
    const updateDto = { day: 'Lunes', open_hours: ['10:00', '11:00', '12:00'] };
    const updatedSchedule = { id: 1, ...updateDto };
    mockScheduleRepository.findOneBy.mockResolvedValue(updatedSchedule);
    mockScheduleRepository.save.mockResolvedValue(updatedSchedule);

    expect(await controller.update(1, updateDto)).toEqual(updatedSchedule);
  });

  it('should throw NotFoundException if schedule does not exist when updating', async () => {
    const updateDto = { day: 'Lunes', open_hours: ['10:00', '11:00', '12:00'] };
    mockScheduleRepository.findOneBy.mockResolvedValue(null);

    await expect(controller.update(1, updateDto)).rejects.toThrowError(
      'Schedule not found',
    );
  });

  it('should delete a schedule successfully', async () => {
    const deletedSchedule = {
      id: 1,
      day: 'Lunes',
      open_hours: ['10:00', '11:00'],
    };

    mockScheduleRepository.findOneBy.mockResolvedValue(deletedSchedule);
    mockScheduleRepository.remove.mockResolvedValue(deletedSchedule);

    expect(await controller.delete(1)).toEqual(deletedSchedule);
  });

  it('should throw BadRequestException if schedule does not exist when deleting', async () => {
    mockScheduleRepository.findOneBy.mockResolvedValue(null);

    await expect(controller.delete(1)).rejects.toThrowError(
      'Schedule not found',
    );
  });
});
