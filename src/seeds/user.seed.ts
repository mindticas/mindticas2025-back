import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from '../entities';
import * as bcryptjs from 'bcryptjs';

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
      phone: '3122913365',
      email: process.env.EMAIL_ADMIN,
      password: process.env.PASSWORD_ADMIN,
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
        console.log(process.env.ADMIN_PASSWORD);
        const hashedPassword = await bcryptjs.hash(user.password, 10);
        const role = await this.roleRepository.findOneBy({ id: user.role_id });
        const newUser = new User();
        Object.assign(newUser, user);
        newUser.password = hashedPassword;
        newUser.role = role;
        await this.userRepository.save(newUser);
      } catch (error) {
        console.error('Error seeding user:', error.message);
      }
    }
    console.log('\u{2705} User seed completed');
  }
}
