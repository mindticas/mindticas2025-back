import { Body, Controller, Post } from '@nestjs/common';
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
  handleWebhook(@Body() body: any) {
    const { button_reply, from } = body;
    if (button_reply) {
      if (button_reply.id === '1') {
        //lOGIC HERE COMING SOON ON TICKET SCRUM-57
        //this.appointmentService.updateStatus(appointmentID, Status.CONFIRMED);
        this.whatsAppservice.sendMessage(
          from,
          messages['appointment_confirmed'],
        );
      } else if (button_reply.id === '2') {
        //lOGIC HERE COMING SOON ON TICKET SCRUM-14
        // this.appointmentService.updateStatus(appointmentID, Status.CANCELED);
        this.whatsAppservice.sendMessage(
          from,
          messages['appointment_canceled'],
        );
      }
    }
  }
}
