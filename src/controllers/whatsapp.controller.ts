import { Body, Controller, Post } from '@nestjs/common';
import { WhatsAppService } from '../services';

@Controller('/webhooks/whapi')
export default class TreatmentController {
  constructor(private whatsAppservice: WhatsAppService) {}

  @Post()
  handleWebhook(@Body() body: any) {
    console.log('Webhook recibido:', body);

    const { button_reply, from } = body;
    if (button_reply) {
      if (button_reply.id === 'confirm') {
        console.log(`\u2705 Cita confirmada por: ${from}`);
      } else if (button_reply.id === 'cancel') {
        console.log(`\u274C Cita cancelada por: ${from}`);
      }
    }
  }
}
