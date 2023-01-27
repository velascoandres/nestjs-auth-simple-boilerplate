import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeEmailDTO {
  @IsEmail()
  email: string;

  @IsEmail()
  newEmail: string;
}

export class ChangeEmailPasswordDTO {
  @IsNotEmpty()
  password: string;

  @IsEmail()
  newEmail: string;
}
