import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import AppointmentDto from './appointment.dto';
import { Role } from '../entities';

export default class UserResponseDto {
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

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role: Role;

  @IsNotEmpty()
  appointments: AppointmentDto[];
}
