import { Body, Controller, HttpCode, Post, Put } from '@nestjs/common';
import { WhatsAppService, AppointmentService } from '../services';
import * as messagesTemplate from '../templates/whatsapp.messages.json';
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
    const { messages } = body;
    if (!messages) return;
    const { id, type, from, reply } = messages[0];
    this.whatsAppservice.sentACK(id);
    if (type !== 'reply' || !reply?.buttons_reply?.id) return;
    const numberRaw = from.slice(-10);
    const buttonId = reply.buttons_reply.id;
    if (buttonId === 'ButtonsV3:1') {
      const lastAppointment = await this.appointmentService.getLastAppointmentByPhone(numberRaw);
      if (!lastAppointment) {
        console.error('Appointment not found');
        return;
      }
      await this.appointmentService.updateStatus(lastAppointment.id, Status.CONFIRMED);
      const params = generateParams(
        lastAppointment.scheduled_start,
        lastAppointment.treatments,
        'appointment_confirmed'
      );
      const formattedMessage = formatMessage(messagesTemplate['appointment_confirmed'], params);
      return this.whatsAppservice.sendMessage(numberRaw, formattedMessage);
    }
    if (buttonId === 'ButtonsV3:2') {
      return this.whatsAppservice.sendMessage(numberRaw, messages['appointment_canceled']);
    }
  }
}
