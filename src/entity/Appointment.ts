import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  OneToOne,
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

  @OneToOne(() => User, (user) => user.appointments)
  @JoinColumn()
  user: User;

  @OneToOne(() => Customer, (customer) => customer.appointment)
  @JoinColumn()
  customer: Customer;

  @ManyToMany(() => Service, (service) => service.appointment)
  @JoinColumn()
  services: Service[];
}
