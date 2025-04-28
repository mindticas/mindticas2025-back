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

@Injectable()
export default class TreatmentService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
  ) {}

  async getAllTreatments(): Promise<Treatment[]> {
    try {
      return this.treatmentRepository.find();
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

  async getTreatment(id: number): Promise<Treatment> {
    const treatment = await this.searchFor(id);
    return treatment;
  }

  async createTreatment(dto: CreateTreatmentDTO): Promise<Treatment> {
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

  async updateTreatment(
    id: number,
    dto: UpdateTreatmentDTO,
  ): Promise<Treatment> {
    const treatment = await this.searchFor(id);
    Object.assign(treatment, dto);

    try {
      return this.treatmentRepository.save(treatment);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update treatment`);
    }
  }

  async deleteTreatment(id: number): Promise<void> {
    const treatment = await this.searchFor(id);
    if (treatment) {
      try {
        this.treatmentRepository.remove(treatment);
      } catch (error) {
        throw new InternalServerErrorException(`Failed to delete treatment`);
      }
    }
  }

  async searchFor(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOneBy({ id });
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID: ${id} not found`);
    }
    return treatment;
  }
}
