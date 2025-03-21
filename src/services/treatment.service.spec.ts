import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentService } from './index';
import { Treatment } from '../entities';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTreatmentDTO, UpdateTreatmentDTO } from '../dtos';

const mockTreatmentRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockTreatment = {
  id: 1,
  name: 'Corte Regular',
  price: 100.78,
  duration: 40,
  description: 'Corte al gusto del cliente sin ningun tratamiento',
};

const createdto: CreateTreatmentDTO = {
  name: 'Corte Regular',
  price: 100.78,
  duration: 40,
  description: 'Corte al gusto del cliente sin ningun tratamiento',
};

const updatedto: UpdateTreatmentDTO = {
  name: 'Corte Punk',
  price: 160,
  duration: 60,
};

describe('TreatmentService', () => {
  let service: TreatmentService;
  let repository: Repository<Treatment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentService,
        {
          provide: getRepositoryToken(Treatment),
          useValue: mockTreatmentRepository,
        },
      ],
    }).compile();

    service = module.get<TreatmentService>(TreatmentService);
    repository = module.get<Repository<Treatment>>(
      getRepositoryToken(Treatment),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTreatments', () => {
    it('should return an array of treatments', async () => {
      mockTreatmentRepository.find.mockResolvedValue([mockTreatment]);

      const result = await service.getAllTreatments();
      expect(result).toEqual([mockTreatment]);
    });

    it('should throw BadRequestException when there is an error', async () => {
      mockTreatmentRepository.find.mockRejectedValue(
        new BadRequestException('Failed to fetch treatments'),
      );

      try {
        await service.getAllTreatments();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Failed to fetch treatments');
      }
    });
  });

  describe('getTreatment', () => {
    it('should return a treatment', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(mockTreatment);

      const result = await service.getTreatment(1);
      expect(result).toEqual(mockTreatment);
    });

    it('should throw NotFoundException when is not found', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(null);

      try {
        await service.getTreatment(1);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Treatment with ID: 1 not found');
      }
    });
  });

  describe('createTreatment', () => {
    it('should successfully create a treatment', async () => {
      const mockTreatment = { ...createdto, id: 1 };
      mockTreatmentRepository.findOne.mockResolvedValue(null);
      mockTreatmentRepository.create.mockReturnValue(mockTreatment);
      mockTreatmentRepository.save.mockResolvedValue(mockTreatment);

      const result = await service.createTreatment(createdto);
      expect(result).toEqual(mockTreatment);
    });

    it('should throw ConflictException if already exists', async () => {
      const existingTreatment = { ...createdto, id: 1 };
      mockTreatmentRepository.findOne.mockResolvedValue(existingTreatment);

      try {
        await service.createTreatment(createdto);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('A treatment with this name already exists');
      }
    });

    it('should throwInternalServerErrorException on save failure', async () => {
      mockTreatmentRepository.findOne.mockResolvedValue(null);
      mockTreatmentRepository.save.mockRejectedValue(
        new InternalServerErrorException('Failed to create treatment'),
      );

      try {
        await service.createTreatment(createdto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create treatment');
      }
    });
  });

  describe('updateTreatment', () => {
    it('should successfully update a treatment', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(mockTreatment);
      mockTreatmentRepository.save.mockResolvedValue({
        ...mockTreatment,
        ...updatedto,
      });

      const result = await service.updateTreatment(1, updatedto);
      expect(result.name).toBe('Corte Punk');
      expect(result.price).toBe(160);
      expect(result.duration).toBe(60);
      expect(result.description).toBe(mockTreatment.description);
    });

    it('should throw NotFoundException if treatment not found', async () => {
      const dto: UpdateTreatmentDTO = { name: 'Updated Treatment' };
      mockTreatmentRepository.findOneBy.mockResolvedValue(null);

      try {
        await service.updateTreatment(1, dto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Treatment with ID: 1 not found');
      }
    });

    it('should throwInternalServerErrorException on save failure', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(mockTreatment);
      mockTreatmentRepository.save.mockRejectedValue(
        new InternalServerErrorException('Failed to update treatment'),
      );

      try {
        await service.updateTreatment(1, updatedto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to update treatment');
      }
    });
  });

  describe('deleteTreatment', () => {
    it('should successfully delete a treatment', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(mockTreatment);
      mockTreatmentRepository.remove.mockResolvedValue(undefined);

      await expect(service.deleteTreatment(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if treatment is not found', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(null);

      try {
        await service.deleteTreatment(1);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Treatment with ID: 1 not found');
      }
    });

    it('should throw InternalServerErrorException remove failure', async () => {
      mockTreatmentRepository.findOneBy.mockResolvedValue(mockTreatment);

      try {
        await service.deleteTreatment(1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to delete treatment');
      }
    });
  });
});
