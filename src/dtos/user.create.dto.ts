import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RoleEnum } from '../enums/role.enum';

export default class UserCreateDto {
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
}
