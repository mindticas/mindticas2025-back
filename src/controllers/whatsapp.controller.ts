import { Body, Controller, HttpCode, Post, Put } from '@nestjs/common';
import { WhatsAppService, AppointmentService } from '../services';
import * as messages from '../templates/whatsapp.messages.json';
import { Status } from '../enums/appointments.status.enum';

@Controller('/webhooks/whapi')
export default class TreatmentController {
  constructor(
    private whatsAppservice: WhatsAppService,
    private appointmentService: AppointmentService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    if (body.messages) {
      this.whatsAppservice.sentACK(body.messages[0].id);
      if (body.messages[0].type == 'reply') {
        console.log('*******respuesta leonel********');
        const numberRaw = body.messages[0].from.slice(-10);
        if (body.messages[0].reply.buttons_reply.id === 'ButtonsV3:1') {
          console.log(`\u2705 Cita confirmada por: ${numberRaw}`);
          //lOGIC HERE COMING SOON ON TICKET SCRUM-57
          //this.appointmentService.updateStatus(appointmentID, Status.CONFIRMED);
          //const appointmentId =
          //const updatedStatus = await this.appointmentService.updateStatus(1 ,Status.CONFIRMED);
          console.log('TE LA CONFIRMO!!!!');
          this.whatsAppservice.sendMessage(
            numberRaw,
            messages['appointment_confirmed'],
          );
          //return { status: 'processed' };
        } else if (body.messages[0].reply.buttons_reply.id === 'ButtonsV3:2') {
          //lOGIC HERE COMING SOON ON TICKET SCRUM-14
          // this.appointmentService.updateStatus(appointmentID, Status.CANCELED);
          this.whatsAppservice.sendMessage(
            numberRaw,
            messages['appointment_canceled'],
          );
          //return { status: 'processed' };
        }
      }
    }
  }
}
