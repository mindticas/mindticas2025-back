import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  password: string;
}
