import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string;

  @Column('text', { array: true })
  open_hours: string[];
}
