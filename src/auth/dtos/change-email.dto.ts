import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDTO {
  @IsEmail()
  email: string;

  @IsEmail()
  newEmail: string;
}

export class ChangeEmailPasswordDTO {
  @ApiProperty({
    type: String,
    description: 'user password',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
    description: 'new user email',
  })
  @IsEmail()
  newEmail: string;
}
