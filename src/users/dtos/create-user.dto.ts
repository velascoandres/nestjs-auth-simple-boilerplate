import { IsAlpha, IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { EmailAvailable } from '@/auth/validations/email-available';

export class CreateUserDTO {
  @ApiProperty({
    type: String,
    description: 'new user email',
  })
  @IsEmail()
  @EmailAvailable({
    message: 'email was taken by another user',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'user password',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
    description: 'user firstname (given name)',
  })
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  firstname: string;

  @ApiProperty({
    type: String,
    description: 'user lastname (family name)',
  })
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  lastname: string;
}
