import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dtos/user.login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByName(loginDto.name);
    if (!user) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }

    const isPasswordValid = await bcryptjs.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }

    const payload = { name: user.name, role: user.role_enum };
    const token = await this.jwtService.signAsync(payload);

    return {
      token: token,
      name: user.name,
    };
  }
}
