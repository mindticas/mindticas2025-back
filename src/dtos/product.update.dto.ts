import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
} from 'class-validator';

export default class ProductUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  stock?: number;
}
