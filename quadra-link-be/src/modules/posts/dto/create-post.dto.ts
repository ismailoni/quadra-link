import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export enum PostVisibility {
  PUBLIC = 'public',
  SCHOOL = 'school',
  PRIVATE = 'private',
}

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsEnum(PostVisibility, {
    message: 'Visibility must be one of: public, school, private',
  })
  visibility?: PostVisibility;
}
