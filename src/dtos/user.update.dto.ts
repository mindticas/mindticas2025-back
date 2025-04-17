import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '../entities';

export default class UserUpdateDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  @IsOptional()
  password: string;

  @IsNotEmpty()
  @IsOptional()
  role_id: Role;
}
