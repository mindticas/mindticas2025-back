import { Transform } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export default class AppointmentUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value, { toClassOnly: true })
  customer_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  treatment_id?: number;

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
