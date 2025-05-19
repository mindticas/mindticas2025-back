import { Transform } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
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

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  products?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  tipAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  salesAmount?: number;
}
