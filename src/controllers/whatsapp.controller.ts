import { Body, Controller, HttpCode, Post, Put } from '@nestjs/common';
import { WhatsAppService, AppointmentService } from '../services';
import * as messages from '../templates/whatsapp.messages.json';
import { Status } from '../enums/appointments.status.enum';
import { formatMessage, generateParams } from '../utils/messageFormatter';

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
        const numberRaw = body.messages[0].from.slice(-10);
        if (body.messages[0].reply.buttons_reply.id === 'ButtonsV3:1') {
          const lastAppointment = await this.appointmentService.getLastAppointmentByPhone(numberRaw);
          if (!lastAppointment) {
            console.error('Appointment no found');
            return;
          }
          const updatedStatus = await this.appointmentService.updateStatus(lastAppointment.id ,Status.CONFIRMED);

          const params = generateParams(
            lastAppointment?.scheduled_start,
            lastAppointment?.treatments,
            'appointment_confirmed'
          );
    
          const formattedMessage = formatMessage(messages['appointment_confirmed'], params);

          this.whatsAppservice.sendMessage(
            numberRaw,
            formattedMessage,
          );
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
