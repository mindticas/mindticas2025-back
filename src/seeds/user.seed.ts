import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';
import * as bcryptjs from 'bcryptjs';
import { RoleEnum } from '../enums/role.enum';

@Injectable()
export default class UserSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  users = [
    {
      name: 'Kevin',
      phone: '3122913365',
      email: process.env.EMAIL_ADMIN,
      password: process.env.PASSWORD_ADMIN,
      role_enum: RoleEnum.ADMIN,
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
        const hashedPassword = await bcryptjs.hash(user.password, 10);
        const newUser = new User();
        Object.assign(newUser, user);
        newUser.password = hashedPassword;
        await this.userRepository.save(newUser);
      } catch (error) {
        console.error('Error seeding user:', error.message);
      }
    }
    console.log('\u{2705} User seed completed');
  }
}
