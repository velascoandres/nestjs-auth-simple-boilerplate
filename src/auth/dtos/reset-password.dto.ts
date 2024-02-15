import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty({
    type: String,
    description: 'old user password(current)',
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    type: String,
    description: 'new user password',
  })
  @IsNotEmpty()
  newPassword: string;
}
