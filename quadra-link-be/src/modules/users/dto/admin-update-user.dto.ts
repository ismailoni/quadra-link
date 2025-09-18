import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsUrl, IsIn } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Transform } from 'class-transformer';


export class AdminUpdateUserDto {
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

    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;
}