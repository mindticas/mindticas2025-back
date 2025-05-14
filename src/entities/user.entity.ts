import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Role, Appointment } from './index';
import { RoleEnum } from '../enums/role.enum';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn()
  role: Role;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    nullable: true,
  })
  role_enum: RoleEnum;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
