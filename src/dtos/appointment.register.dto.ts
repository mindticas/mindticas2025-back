import { IsNumber, IsString, IsDateString, IsNotEmpty } from 'class-validator';

export default class AppointmentRegisterDto {
  @IsString()
  @IsNotEmpty()
  nameCustomer: string;

  @IsString()
  @IsNotEmpty()
  phoneCustomer: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledStart: string;

  @IsNumber({}, { each: true })
  service_id: number[];
}
