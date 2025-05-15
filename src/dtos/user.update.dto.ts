import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RoleEnum } from '../enums/role.enum';

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

  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role_enum: RoleEnum;
}
