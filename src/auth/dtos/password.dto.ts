import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PasswordDTO {
  @ApiProperty({
    type: String,
    description: 'user password',
  })
  @IsNotEmpty()
  password: string;
}
