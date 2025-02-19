import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { Customer, User, Service } from './index';

@Entity()
export default class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  scheduled_at: Date;

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

  @ManyToMany(() => Service, (service) => service.appointments, {
    cascade: true,
  })
  @JoinTable()
  services: Service[];
}
