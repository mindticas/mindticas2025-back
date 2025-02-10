import { Entity, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from 'typeorm';
import { Appointment } from './Appointment';
import { Service } from './Service';

@Entity()
export class AppointmentService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.appointmentServices,
    { onDelete: 'CASCADE' },
  )
  appointment: Appointment;

  @ManyToMany(() => Service, (service) => service.appointmentServices, {
    onDelete: 'CASCADE',
  })
  service: Service;
}
