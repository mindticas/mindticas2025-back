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
  nameCustomer: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phoneCustomer: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledStart: string;

  @IsNumber({}, { each: true })
  service_id: number[];
}
