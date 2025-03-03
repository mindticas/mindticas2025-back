import {
  IsNumber,
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
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
  scheduledStart: string;

  @IsNumber({}, { each: true })
  treatment_ids: number[];
}
