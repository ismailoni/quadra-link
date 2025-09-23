import { IsEnum, IsOptional, IsString, IsNotEmpty ,MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { IsSchoolEmailValid } from '../../../validators/SchoolEmailValidator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  school: string;

  @IsNotEmpty()
  @IsString()
  @IsSchoolEmailValid({
    message: 'Email must be valid for the specified school'
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be longer than or equal to 6 characters' })
  password: string;

  @IsNotEmpty()
  @IsString()
  Firstname: string;

  @IsNotEmpty()
  @IsString()
  Lastname: string;

  @IsNotEmpty()
  @IsString()
  Pseudoname: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
