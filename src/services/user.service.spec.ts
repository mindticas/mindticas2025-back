import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserCreateDto, UserUpdateDto } from '../dtos';
import { userFilters } from '../utils/filter';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
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

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findByName', () => {
    it('should return a user when found by name', async () => {
      const mockUser = {
        id: 1,
        name: 'Kevin',
        appointments: [],
        role: { id: 1, name: 'admin', users: [] },
      } as User;
      userRepository.findOne.mockResolvedValue(mockUser);

      const user = await userService.findByName('Kevin');

      expect(user).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Kevin' },
      });
    });

    it('should return null if no user is found by name', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const user = await userService.findByName('NonExistentName');

      expect(user).toBeNull();
    });
  });

  describe('get', () => {
    it('should return mapped users without filter', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'Kevin',
          phone: '123',
          email: 'kevin@example.com',
          role: { id: 1, name: 'Admin', users: [] },
          appointments: [],
        },
      ] as User[];

      userRepository.find.mockResolvedValue(mockUsers);

      const result = await userService.get(null);

      expect(result[0].id).toBe(mockUsers[0].id);
      expect(result[0].name).toBe(mockUsers[0].name);
    });

    it('should apply a valid filter', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'Kevin',
          role: { id: 1, name: 'Admin', users: [] },
          appointments: [],
        },
      ] as User[];

      userRepository.find.mockResolvedValue(mockUsers);
      userFilters['CUSTOMER_NAME_ASC'] = jest
        .fn()
        .mockReturnValue([mockUsers[0]]);

      const result = await userService.get('CUSTOMER_NAME_ASC');
      expect(userFilters['CUSTOMER_NAME_ASC']).toHaveBeenCalled();
      expect(result).toEqual([mockUsers[0]]);
    });

    it('should throw for invalid filter param', async () => {
      userRepository.find.mockResolvedValue([]);
      await expect(userService.get('INVALID')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const dto: UserCreateDto = {
        name: 'Kevin',
        email: 'test@example.com',
        phone: '123',
        password: '1234',
        role_id: { id: 1, name: 'admin', users: [] },
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({
        id: 1,
        ...dto,
        role: dto.role_id,
        appointments: [],
      } as User);
      
      userRepository.save.mockResolvedValue({
        id: 1,
        ...dto,
        role: dto.role_id,
        appointments: [],
      } as User);

      const result = await userService.create(dto);
      expect(result.id).toBe(1);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw if user already exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        appointments: [],
        role: { id: 1, name: 'admin', users: [] },
      } as User);

      await expect(
        userService.create({
          name: 'Kevin',
          email: 'test@example.com',
          phone: '123',
          password: '1234',
          role_id: { id: 1, name: 'admin', users: [] },
        }),
      ).rejects.toThrowError(
        'Usuario existente, usa diferentes credenciales para crear uno.',
      );
    });

    it('should throw on DB error', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({
        appointments: [],
        role: { id: 1, name: 'admin', users: [] },
      } as User);
      userRepository.save.mockRejectedValue(new Error());

      await expect(
        userService.create({
          name: 'Kevin',
          email: 'test@example.com',
          phone: '123',
          password: '1234',
          role_id: { id: 1, name: 'admin', users: [] },
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const mockUser = {
        id: 1,
        name: 'Old',
        email: 'old@example.com',
        phone: '111',
        password: 'oldpass',
        role: { id: 1, name: 'admin', users: [] },
        appointments: [],
      } as User;

      const updatedDto: UserUpdateDto = {
        name: 'New',
        email: 'new@example.com',
        phone: '222',
        password: 'newpass',
        role_id: { id: 2, name: 'user', users: [] },
      };

      jest.spyOn(userService, 'searchFor').mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        ...updatedDto,
        role: updatedDto.role_id,
      });

      const result = await userService.update(1, updatedDto);
      expect(result.name).toBe('New');
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const mockUser = {
        id: 1,
        appointments: [],
        role: { id: 1, name: 'admin', users: [] },
      } as User;

      jest.spyOn(userService, 'searchFor').mockResolvedValue(mockUser);
      userRepository.remove.mockResolvedValue(mockUser);

      await expect(userService.delete(1)).resolves.toBeUndefined();
      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw if user not found', async () => {
      jest
        .spyOn(userService, 'searchFor')
        .mockRejectedValue(new Error('Usuario no encontrado'));

      await expect(userService.delete(999)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });
  });
});
