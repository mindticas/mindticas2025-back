import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Role, Appointment } from './index';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  Name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Role, (role) => role.users)
  @JoinColumn()
  role: Role;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
