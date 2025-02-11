import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { AppointmentService } from './index';

@Entity()
export default class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 6, scale: 2 })
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
