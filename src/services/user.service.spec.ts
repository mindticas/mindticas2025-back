import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should return a user when found by name', async () => {
    const mockUser = {
      id: 1,
      name: 'Kevin',
      password: 'hashedpassword',
      phone: '3125463221',
      email: 'kevin@example.com',
      role: {
        id: 1,
        name: 'admin',
        users: [],
      },
      appointments: [],
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const user = await userService.findByName('Kevin');

    expect(user).toEqual(mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { name: 'Kevin' },
    });
  });

  it('should return null if no user is found by name', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    const user = await userService.findByName('NonExistentName');

    expect(user).toBeNull();
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { name: 'NonExistentName' },
    });
  });
});
