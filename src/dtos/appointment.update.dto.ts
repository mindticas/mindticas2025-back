import { Transform } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

export default class AppointmentUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  customer_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  treatments_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  status?: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  scheduled_start?: string;
}
