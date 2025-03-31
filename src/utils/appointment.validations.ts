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
  return existingAppointment;
}

export function validateAppointment(start: Date): void {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 7);

  if (start > maxDate || start < today) {
    throw new BadRequestException(
      'Appointments must be scheduled within a range of the next 7 days.',
    );
  }
}
