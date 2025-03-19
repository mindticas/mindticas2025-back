import {
  IsNumber,
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  ArrayNotEmpty,
  IsArray,
  IsOptional,
} from 'class-validator';

export default class AppointmentUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  scheduled_start?: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  treatment_ids?: number[];
}
