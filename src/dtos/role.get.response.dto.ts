import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { User } from '../entities';

export default class RoleResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  users?: User[];
}
