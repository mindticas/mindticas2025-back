import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from '../controllers';
import { WhatsAppService } from '../services';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export default class WhatsAppModule {}
