import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { AppointmentService } from './AppointmentService';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  duration: number;

  @Column()
  description: string;

  @ManyToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.service,
  )
  appointmentServices: AppointmentService[];
}
