import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto, UserCreateDto, UserUpdateDto } from '../dtos';
import { userFilters } from '../utils/filter';
import * as bcryptjs from 'bcryptjs';
import { RoleEnum } from '../enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async get(param: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: { appointments: true },
    });

    const userResponse = users.map((user) => this.mapToUserResponse(user));

    if (param) {
      const filterKey = param.toUpperCase();
      if (!Object.keys(userFilters).includes(filterKey)) {
        throw new BadRequestException(`Parametro Inválido: ${param}`);
      }
      return userFilters[filterKey](userResponse);
    }

    return userResponse;
  }

  async getById(id: number): Promise<UserResponseDto> {
    const user = await this.searchFor(id);

    if (!user) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return this.mapToUserResponse(user);
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
      throw new Error(
        'Usuario existente, usa diferentes credenciales para crear uno.',
      );
    }

    try {
      const user = this.userRepository.create({
        ...createDto,
        password: bcryptjs.hashSync(createDto.password, 10),
        role_enum: RoleEnum.EMPLOYEE,
      });
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
      relations: {
        appointments: {
          treatments: true,
          customer: true,
        },
      },
    });

    if (!user) {
      throw new InternalServerErrorException(`Usuario no encontrado`);
    }

    return user;
  }

  private mapToUserResponse(user: User): UserResponseDto {
    const userResponse = new UserResponseDto();
    userResponse.id = user.id;
    userResponse.name = user.name;
    userResponse.phone = user.phone;
    userResponse.email = user.email;
    userResponse.appointments = user.appointments;
    return userResponse;
  }
}
