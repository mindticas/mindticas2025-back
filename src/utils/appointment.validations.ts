import { BadRequestException } from '@nestjs/common';
import Appointment from '../entities/appointment.entity';
import { Repository } from 'typeorm';

export async function existingAppointment(
  scheduledStart: Date,
  appointmentRepository: Repository<Appointment>,
): Promise<Appointment | null> {
  const existingAppointment = await appointmentRepository.findOne({
    where: { scheduled_start: scheduledStart },
  });

  if (!existingAppointment) {
    return null;
  }

  if (existingAppointment.status === 'canceled') {
    return null;
  }

  return existingAppointment;
}

export function validateAppointment(start: Date): void {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 7);
  maxDate.setHours(maxDate.getHours() + 7);

  if (start > maxDate || start < today) {
    throw new BadRequestException(
      'Las citas deben programarse dentro de un intervalo de los 7 días siguientes.',
    );
  }
}
