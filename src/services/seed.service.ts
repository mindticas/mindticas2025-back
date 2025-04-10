import { Injectable } from '@nestjs/common';
import { UserSeed, RoleSeed, ScheduleSeed } from '../seeds';

@Injectable()
export default class SeedService {
  constructor(
    private readonly userSeed: UserSeed,
    private readonly roleSeed: RoleSeed,
    private readonly scheduleSeed: ScheduleSeed,
  ) {}

  async run() {
    await this.roleSeed.run();
    await this.userSeed.run();
    await this.scheduleSeed.run();
    console.log('Seeding completed!');
  }
}
