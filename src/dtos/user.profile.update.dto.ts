import { IsOptional, IsString, IsObject } from 'class-validator';

export default class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  contactDetails?: Record<string, string>;

  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;
}
