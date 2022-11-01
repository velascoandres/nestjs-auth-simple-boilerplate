import { IsNotEmpty } from 'class-validator';

export class PasswordDTO {
  @IsNotEmpty()
  password: string;
}
