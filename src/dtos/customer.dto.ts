import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { AppointmentDto } from './';

export default class CustomerDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  appointments?: AppointmentDto[];
}
