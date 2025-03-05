import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from '../entities';

@Injectable()
export default class UserSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  users = [
    {
      name: 'Kevin',
      phone: '3124567676',
      email: 'kevin@gmail.com',
      password: 'nomejakies',
      role_id: 1,
    },
  ];

  async run() {
    for (const user of this.users) {
      const existingUser = await this.userRepository.findOneBy({
        name: user.name,
      });
      if (existingUser) {
        console.log(`\u{26A0} ${user.name} user already seeded.`);
        continue;
      }
      try {
        const role = await this.roleRepository.findOneBy({ id: user.role_id });
        const newUser = new User();
        Object.assign(newUser, user);
        newUser.role = role;
        await this.userRepository.save(newUser);
        console.log(`\u{2705} ${user.name} role seeded successfully`);
      } catch (error) {
        console.error('Error seeding user:', error.message);
      }
    }
    console.log('\u{2705} User seed completed');
  }
}
