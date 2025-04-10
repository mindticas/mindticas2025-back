import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from '../controllers';
import { WhatsAppService } from '../services';
import AppointmentModule from './appointment.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [HttpModule, forwardRef(() => AppointmentModule), AuthModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export default class WhatsAppModule {}
