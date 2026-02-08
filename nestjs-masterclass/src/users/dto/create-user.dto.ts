import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @IsOptional()
  name?: string;
}
