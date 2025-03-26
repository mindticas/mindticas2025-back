import { Transform } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';

export default class AppointmentUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value, { toClassOnly: true })
  customer_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value, { toClassOnly: true })
  treatment_name?: string;

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
