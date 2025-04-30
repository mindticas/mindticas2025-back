import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Treatment } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTreatmentDTO, UpdateTreatmentDTO } from '../dtos';
import { treatmentFilters } from '../utils/filter';

@Injectable()
export default class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
  ) {}

  async get(param: string): Promise<Treatment[]> {
    try {
      const treatments =
        this.treatmentRepository.createQueryBuilder('treatment');

      if (!param) {
        return treatments
          .leftJoinAndSelect('treatment.appointments', 'appointment')
          .getMany();
      }
      const filterKey = param.toUpperCase();
      if (filterKey) {
        const filterFn = treatmentFilters[filterKey];
        if (!filterFn) {
          throw new BadRequestException(`Parámetro inválido: ${param}`);
        }
        return filterFn(treatments).getMany();
      }
    } catch (error) {
      throw new BadRequestException('Failed to fetch treatments');
    }
  }

  async getAllTreatmentsNames(): Promise<string[]> {
    const treatments = await this.treatmentRepository.find({
      select: ['name'],
      order: { name: 'ASC' },
    });

    return treatments.map((treatment) => treatment.name);
  }

  async getById(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOneBy({ id });
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID: ${id} not found`);
    }
    return treatment;
  }

  async create(dto: CreateTreatmentDTO): Promise<Treatment> {
    const existingTreatment = await this.treatmentRepository.findOne({
      where: { name: dto.name },
    });

    if (existingTreatment) {
      throw new ConflictException('A treatment with this name already exists');
    }

    const treatment = this.treatmentRepository.create(dto);

    try {
      return this.treatmentRepository.save(treatment);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create treatment`);
    }
  }

  async update(id: number, dto: UpdateTreatmentDTO): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOneBy({ id });
    if (!treatment)
      throw new NotFoundException(`Treatment with ID: ${id} not found`);

    const existing = await this.treatmentRepository.findOne({
      where: { name: dto.name },
    });
    if (existing?.name === dto.name)
      throw new ConflictException('A treatment with this name already exists');

    try {
      return this.treatmentRepository.save(Object.assign(treatment, dto));
    } catch {
      throw new InternalServerErrorException('Failed to update treatment');
    }
  }

  async delete(id: number): Promise<void> {
    const treatment = await this.treatmentRepository.findOneBy({ id });
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID: ${id} not found`);
    }
    try {
      this.treatmentRepository.remove(treatment);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete treatment`);
    }
  }
}
