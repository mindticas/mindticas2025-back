import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../services/user.service';
import * as bcryptjs from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByName: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return a token for valid credentials', async () => {
    jest
      .spyOn(bcryptjs, 'compare')
      .mockImplementation((password: string, hash: string) => {
        return Promise.resolve(password === 'password123');
      });

    const loginDto = { name: 'Kevin', password: 'password123' };

    jest.spyOn(userService, 'findByName').mockResolvedValue({
      name: 'Kevin',
      password: 'hashedpassword',
    } as any);

    const result = await authService.login(loginDto);

    expect(result.token).toBe('token');
    expect(result.name).toBe('Kevin');

    expect(userService.findByName).toHaveBeenCalledWith('Kevin');

    expect(bcryptjs.compare).toHaveBeenCalledWith(
      'password123',
      'hashedpassword',
    );
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    jest
      .spyOn(bcryptjs, 'compare')
      .mockImplementation((password: string, hash: string) => {
        return Promise.resolve(false);
      });

    const loginDto = { name: 'Kevin', password: 'wrongpassword' };

    jest.spyOn(userService, 'findByName').mockResolvedValue({
      name: 'Kevin',
      password: 'hashedpassword',
    } as any);

    await expect(authService.login(loginDto)).rejects.toThrowError(
      UnauthorizedException,
    );

    expect(userService.findByName).toHaveBeenCalledWith('Kevin');
    expect(bcryptjs.compare).toHaveBeenCalledWith(
      'wrongpassword',
      'hashedpassword',
    );
  });
});
