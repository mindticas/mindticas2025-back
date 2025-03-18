import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { WhatsAppService } from '../services';

@Controller('/webhooks/whapi')
export default class TreatmentController {
  constructor(private whatsAppservice: WhatsAppService) {}
  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    const webhook = await this.whatsAppservice.handleWebhook(body);
    return webhook;
  }
}
