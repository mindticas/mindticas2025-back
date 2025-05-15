import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import AppointmentDto from './appointment.dto';
import { RoleEnum } from '../enums/role.enum';

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

  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role_enum: RoleEnum;

  @IsNotEmpty()
  appointments: AppointmentDto[];
}
