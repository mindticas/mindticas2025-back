import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import AppointmentDto from './appointment.dto';
import { Role } from '../entities';

export default class UserResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  role: Role;

  @IsNotEmpty()
  appointments: AppointmentDto[];
}
