import { IsOptional, IsString, MinLength, IsUrl, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  @IsIn(['100', '200', '300', '400', '500'], { message: 'Invalid level' })
  level?: string;
}
