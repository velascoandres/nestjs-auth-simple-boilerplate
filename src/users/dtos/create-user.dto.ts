import { IsAlpha, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { EmailAvailable } from '../../auth/validations/email-available';

export class CreateUserDTO {
  @IsEmail()
  @EmailAvailable({
    message: 'email was taken by another user',
  })
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  lastname: string;
}
