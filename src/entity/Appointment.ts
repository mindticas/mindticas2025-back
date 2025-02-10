import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Customer } from './Customer';
import { AppointmentService } from './AppointmentService';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  scheduled_at: Date;

  @Column()
  user_id: number;

  @Column()
  total_price: number;

  @Column()
  duration: number;

  @ManyToOne(() => Customer, (customer) => customer.appointments, {
    nullable: false,
  })
  customer: Customer;

  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.appointment,
  )
  appointmentServices: AppointmentService[];
}
