import { Controller, Get, Post, Query, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import SeedService from './services/seed.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seedService: SeedService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('run-seed')
  async runSeed(@Query('token') token: string) {
    if (token !== process.env.SEED_SECRET_KEY) {
      throw new UnauthorizedException();
    }
    await this.seedService.run();
    return { message: 'Seeds ejecutadas correctamente' };
  }
}
