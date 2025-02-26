import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { Customer, User, Treatment } from './index';
import { AppointmentStatus } from '../enums/appointments.status.enum';

@Entity()
export default class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
    nullable: false,
  })
  status: AppointmentStatus;

  @Column({ nullable: false })
  scheduled_start: Date;

  @Column('decimal', { precision: 7, scale: 2, nullable: false })
  total_price: number;

  @Column({ nullable: false })
  duration: number;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.appointments)
  @JoinColumn()
  customer: Customer;

  @ManyToMany(() => Treatment, (treatment) => treatment.appointments, {
    cascade: true,
  })
  @JoinTable()
  treatments: Treatment[];
}
