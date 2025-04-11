import { Injectable, OnModuleInit } from '@nestjs/common';
import { initDB } from './db-init';

@Injectable()
export class AppService implements OnModuleInit {

  async onModuleInit() {
    await initDB();
  }

  getHello(): string {
    return 'Hello michelada.io!';
  }
}
