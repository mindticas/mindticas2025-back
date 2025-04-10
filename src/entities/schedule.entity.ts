import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index('unique_day', ['day'], { unique: true })
export default class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string;

  @Column('text', { array: true })
  open_hours: string[];
}
