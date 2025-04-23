import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export default class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async get(): Promise<Role[]> {
    try {
      return this.roleRepository.find();
    } catch (error) {
      throw new BadRequestException('Error al cargar roles.');
    }
  }
}
