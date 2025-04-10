import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export default class CreateScheduleDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsString()
  day: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString()
  open_hours: string[];
}
