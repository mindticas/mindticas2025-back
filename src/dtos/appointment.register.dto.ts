import {
  IsNumber,
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export default class AppointmentRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledStart: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @IsNumber({}, { each: true })
  treatment_id: number[];
}
