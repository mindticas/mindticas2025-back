import { Injectable } from '@nestjs/common';
import { UserSeed, RoleSeed } from '../seeds';

@Injectable()
export default class SeedService {
  constructor(
    private readonly userSeed: UserSeed,
    private readonly roleSeed: RoleSeed,
  ) {}

  async run() {
    await this.roleSeed.run();
    await this.userSeed.run();
    console.log('Seeding completed!');
  }
}
