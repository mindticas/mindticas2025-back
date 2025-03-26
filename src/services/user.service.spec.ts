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
      phone: '3125463221',  // Añadido
      email: 'kevin@example.com', // Añadido
      role: {
        id: 1,
        name: 'admin',
        users: [],  // Ahora el role tiene la propiedad 'users'
      },  
      appointments: [],  // Añadido
    };

    // Simula el comportamiento de `findOne` para devolver un usuario
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const user = await userService.findByName('Kevin');

    expect(user).toEqual(mockUser); // Verifica que el usuario encontrado sea el esperado
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Kevin' } }); // Verifica que `findOne` se haya llamado correctamente
  });

  it('should return null if no user is found by name', async () => {
    // Simula que no se encuentra un usuario
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    const user = await userService.findByName('NonExistentName');

    expect(user).toBeNull(); // Verifica que no se haya encontrado un usuario
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { name: 'NonExistentName' } }); // Verifica que `findOne` se haya llamado correctamente
  });
});
