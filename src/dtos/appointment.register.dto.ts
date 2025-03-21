import {
  IsNumber,
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

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
  scheduled_start: string;

  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  treatment_ids: number[];
}
