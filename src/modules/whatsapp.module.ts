import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from '../controllers';
import { WhatsAppService } from '../services';

@Module({
  imports: [HttpModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export default class WhatsAppModule {}
