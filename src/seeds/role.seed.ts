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

  roles = [{ name: 'Admin' }];

  async run() {
    for (const { name } of this.roles) {
      const existingRole = await this.roleRepository.findOneBy({ name });
      if (existingRole) {
        console.log(`\u{26A0} ${name} role already seeded.`);
        continue;
      }

      try {
        const roleEntity = this.roleRepository.create({ name });
        await this.roleRepository.save(roleEntity);
        console.log(`\u{2705} ${name} role seeded successfully`);
      } catch (error) {
        console.error('Error seeding role:', error.message);
      }
    }
    console.log('\u{2705} Role seed completed');
  }
}
