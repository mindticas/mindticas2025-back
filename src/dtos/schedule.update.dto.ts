import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export default class UpdateScheduleDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsString()
  day?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  open_hours?: string[];
}
