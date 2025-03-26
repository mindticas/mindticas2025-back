import {
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { LoginDto } from '../dtos/user.login.dto';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  profile(@Request() req) {
    return req.user;
  }
}
