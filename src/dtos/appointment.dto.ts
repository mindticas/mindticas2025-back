import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
  IsInt,
  IsUUID,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Status } from '../enums/appointments.status.enum';
import { Treatment } from '../entities';
import { CustomerDto, UserNameDto } from './';

export default class AppointmentDto {
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
  @IsString()
  user: UserNameDto;

  @IsNotEmpty()
  customer: CustomerDto;

  @IsNotEmpty()
  treatments: Treatment[];
}
