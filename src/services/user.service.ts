import { Injectable } from '@nestjs/common';
import { User } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByName(name: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { name: name } });
    return user;
  }
}
