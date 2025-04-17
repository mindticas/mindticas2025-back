import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto, UserCreateDto, UserUpdateDto } from '../dtos';
import { userFilters } from '../utils/filter';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async get(param: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: { role: true, appointments: true },
    });

    const userResponse = users.map((user) => {
      return {
        ...user,
      };
    });

    if (param) {
      return userFilters[param](userResponse);
    }

    return userResponse;
  }

  async create(crateDto: UserCreateDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: crateDto.email,
        phone: crateDto.phone,
        name: crateDto.name,
      },
    });

    if (existingUser) {
      throw new Error('Usuario existente, usa difentes credenciales para crear uno.');
    }
    const user = this.userRepository.create(crateDto);
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    user.password = hashedPassword;
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(`Error al crear usuario`);
    }
  }

  async update(id: number, dto: UserUpdateDto): Promise<User> {
    const user = await this.searchFor(id);
    console.log(user);
    Object.assign(user, dto);
    try {
      return this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Erro al actualizar el usuario');
    }
  }

  async delete(id: number): Promise<void> {
    const user = await this.searchFor(id);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (user) {
      try {
        await this.userRepository.remove(user);
      } catch (error) {
        throw new InternalServerErrorException(`Error al eliminar el usuario`);
      }
    }
  }

  async findByName(name: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { name: name } });
    return user;
  }

  async searchFor(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: { role: true },
    });

    if (!user) {
      throw new InternalServerErrorException(`Usuario no encontrado`);
    }

    return user;
  }
}
