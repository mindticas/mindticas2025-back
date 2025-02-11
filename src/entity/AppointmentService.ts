import { Entity, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from 'typeorm';
import { Appointment, Service } from './index';

@Entity()
export default class AppointmentService {
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
