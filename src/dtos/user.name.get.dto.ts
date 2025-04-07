import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export default class UserNameDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  name: string;
}
