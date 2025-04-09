import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { AppointmentDto, UserNameDto } from './';

export default class CustomerResponseDto {
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

  @IsNotEmpty()
  user: UserNameDto;
}
