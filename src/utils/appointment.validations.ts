import { BadRequestException } from '@nestjs/common';
import Appointment from '../entities/appointment.entity';
import { Repository } from 'typeorm';
import { Status } from '../enums/appointments.status.enum';

export async function   existingAppointment(
  scheduledStart: Date,
  appointmentRepository: Repository<Appointment>,
): Promise<void> {

  const appointments = await appointmentRepository.find({
    where: { scheduled_start: scheduledStart },
  });

  const activeAppointments = appointments.filter(
    (a) => a.status !== Status.CANCELED,
  );
  
  if (activeAppointments.length > 0) {
    throw new BadRequestException(
      'Ya hay una cita agendada en este horario.',
    );
  }
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