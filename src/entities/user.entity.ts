import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './index';
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

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.EMPLOYEE,
  })
  role: RoleEnum;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
