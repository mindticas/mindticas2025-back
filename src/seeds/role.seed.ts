import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities';

@Injectable()
export default class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async run() {
    const existingUsers = await this.roleRepository.find();
    if (existingUsers.length > 0) {
      console.log('\u{26A0} Role already seeded, skipping role seeding');
      return;
    }

    const role = {
      id: 1,
      name: 'Admin',
    };

    const roleEntity = this.roleRepository.create(role);
    await this.roleRepository.save(roleEntity);

    console.log('\u{2705} Role seeded successfully');
  }
}
