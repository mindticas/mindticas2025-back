import { IsNotEmpty, IsString } from 'class-validator';

export default class CustomerRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
