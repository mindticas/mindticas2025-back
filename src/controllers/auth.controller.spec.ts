import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from '../services/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockAuthGuard: any;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      findByName: jest
        .fn()
        .mockResolvedValue({ name: 'Kevin', password: 'hashedpassword' }),
    };

    mockAuthGuard = {
      canActivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a token for valid credentials', async () => {
    const loginDto = { name: 'Kevin', password: 'password123' };

    jest.spyOn(authService, 'login').mockResolvedValue({
      token: 'token',
      name: 'Kevin',
    });

    const result = await controller.login(loginDto);

    expect(result.token).toBe('token');
    expect(result.name).toBe('Kevin');
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    const loginDto = { name: 'Kevin', password: 'wrongpassword' };

    jest
      .spyOn(authService, 'login')
      .mockRejectedValue(new UnauthorizedException());

    await expect(controller.login(loginDto)).rejects.toThrowError(
      UnauthorizedException,
    );
  });

  it('should return user profile when valid token is provided', async () => {
    const mockRequest = { user: { name: 'Kevin' } };

    mockAuthGuard.canActivate.mockResolvedValue(true);

    const result = await controller.profile(mockRequest);

    expect(result).toEqual(mockRequest.user);
  });
});
