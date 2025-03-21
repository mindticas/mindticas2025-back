import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export default class CustomerRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;
}
