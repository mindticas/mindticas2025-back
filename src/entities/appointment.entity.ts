import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer, User, Treatment } from './index';
import { status } from '../enums/appointments.status.enum';

@Entity()
export default class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: status,
    default: status.PENDING,
    nullable: false,
  })
  status: status;

  @Column({ nullable: false })
  scheduled_start: Date;

  @Column('decimal', { precision: 7, scale: 2, nullable: false })
  total_price: number;

  @Column({ nullable: false })
  duration: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

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
