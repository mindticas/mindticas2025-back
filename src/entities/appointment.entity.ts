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
import { Customer, User, Treatment, Product } from './index';
import { Status } from '../enums/appointments.status.enum';

@Entity()
export default class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
    nullable: false,
  })
  status: Status;

  @Column({ nullable: false })
  scheduled_start: Date;

  @Column('decimal', { precision: 7, scale: 2, nullable: false })
  total_price: number;

  @Column({ nullable: false })
  duration: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tipAmount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  salesAmount: number;

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

  @ManyToMany(() => Product, (product) => product.appointments, {
    nullable: true,
  })
  @JoinTable()
  products: Product[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  eventId?: string;
}
