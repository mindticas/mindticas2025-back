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
      const userResponse = new UserResponseDto();
      userResponse.id = user.id;
      userResponse.name = user.name;
      userResponse.phone = user.phone;
      userResponse.email = user.email;
      userResponse.role = user.role;
      userResponse.appointments = user.appointments;

      return userResponse;
    });

    if (param && userFilters[param]) {
      return userFilters[param](users);
    } else if (param) {
      throw new BadRequestException(`Parámetro de filtro inválido: ${param}`);
    }

    return userResponse;
  }

  async create(createDto: UserCreateDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createDto.email,
        phone: createDto.phone,
        name: createDto.name,
      },
    });

    if (existingUser) {
      throw new Error('Usuario existente, usa diferentes credenciales para crear uno.');
    }
    const user = this.userRepository.create(createDto);
    const hashedPassword = await bcryptjs.hash(createDto.password, 10);
    user.password = hashedPassword;
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(`Error al crear usuario`);
    }
  }

  async update(id: number, dto: UserUpdateDto): Promise<User> {
    const user = await this.searchFor(id);
    Object.assign(user, dto);
    try {
      return this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el usuario');
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
