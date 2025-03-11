import { Module } from '@nestjs/common';
import { WhatsappService } from '../services/whatsapp.service';
@Module({
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsAppModule {}
