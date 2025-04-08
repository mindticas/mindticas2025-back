import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
  IsInt,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Status } from '../enums/appointments.status.enum';
import { Customer, Treatment, User } from '../entities';

export class AppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;

  @IsDateString()
  scheduled_start: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total_price: number;

  @IsInt()
  @IsPositive()
  duration: number;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsNotEmpty()
  user: User;

  @IsNotEmpty()
  customer: Customer;

  @IsNotEmpty()
  treatments: Treatment[];
}
