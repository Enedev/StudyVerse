import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(2, 80)
  displayName: string;
}
