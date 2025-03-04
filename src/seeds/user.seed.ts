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

  async run() {
    const existingUsers = await this.userRepository.find();
    if (existingUsers.length > 0) {
      console.warn('\u{26A0} Users already seeded, skipping role seeding');
      return;
    }

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'Admin' },
    });
    if (!adminRole) {
      console.warn('\u{26A0} Admin role not found, skipping user seeding');
      return;
    }

    const user = {
      name: 'Kevin',
      phone: '3124567676',
      email: 'kevin@gmail.com',
      password: 'nomejakies',
      role: adminRole,
    };

    const userEntity = this.userRepository.create(user);
    await this.userRepository.save(userEntity);

    console.log('\u{2705} User seeded successfully');
  }
}
