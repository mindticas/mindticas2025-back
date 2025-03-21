import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export default class CreateTreatmentDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name should not exceed 100 characters' })
  name: string;
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with up to 2 decimal places' },
  )
  price: number;
  @IsNumber()
  @IsNotEmpty({ message: 'Duration is required' })
  @IsInt({ message: 'Duration must be an integer' })
  @Max(480, { message: 'Maximum duration up to 480 minutes' })
  duration: number;
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(5, { message: 'Description should have at least 5 characters' })
  @MaxLength(400, { message: 'Description should not exceed 400 characters' })
  description: string;
}
