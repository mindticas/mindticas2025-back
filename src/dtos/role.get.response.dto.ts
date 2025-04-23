import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export default class RoleResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}
