import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserProfile } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserProfileDto } from '../dtos';
import { Repository } from 'typeorm';

@Injectable()
export default class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async get(): Promise<UserProfile[]> {
    return await this.userProfileRepository.find();
  }

  async update(id: number, dto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException(`Informacion del perfil no encontrado`);
    }

    try {
      return await this.userProfileRepository.save(Object.assign(profile, dto));
    } catch (error) {
      throw new BadRequestException('Error al actualizar el perfil');
    }
  }
}
