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

@Entity()
export default class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pending' })
  status: string;

  @Column()
  scheduled_start: Date;

  @Column('decimal', { precision: 7, scale: 2 })
  total_price: number;

  @Column()
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
