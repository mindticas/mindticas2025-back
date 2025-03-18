import { Body, Controller, Get, HttpCode, Logger, Post } from '@nestjs/common';
import { WhatsAppService, AppointmentService } from '../services';
import * as messages from '../templates/whatsapp.messages.json';
import { Status } from '../enums/appointments.status.enum';
import { WhatsAppController } from '.';

@Controller('/webhooks/whapi')
export default class TreatmentController {
  private readonly logger = new Logger(WhatsAppController.name);
  constructor(
    private whatsAppservice: WhatsAppService,
    private appointmentService: AppointmentService,
  ) {}

  @Get()
  @HttpCode(200)
  healthCheck() {
    return { status: 'Webhook is working' };
  }

  @Post()
  @HttpCode(200)
  handleWebhook(@Body() body: any) {
    if (body.messages) {
      this.whatsAppservice.sentACK(body.messages[0].id);

      if (body.messages[0].type == 'reply') {
        const numberRaw = body.messages[0].from.slice(-10);

        if (body.messages[0].reply.buttons_reply.id === 'ButtonsV3:1') {
          //lOGIC HERE COMING SOON ON TICKET SCRUM-57
          //this.appointmentService.updateStatus(appointmentID, Status.CONFIRMED);
          this.whatsAppservice.sendMessage(
            numberRaw,
            messages['appointment_confirmed'],
          );
        } else if (body.messages[0].reply.buttons_reply.id === 'ButtonsV3:2') {
          //lOGIC HERE COMING SOON ON TICKET SCRUM-14
          // this.appointmentService.updateStatus(appointmentID, Status.CANCELED);
          this.whatsAppservice.sendMessage(
            numberRaw,
            messages['appointment_canceled'],
          );
        }
      }
    }
  }
}
