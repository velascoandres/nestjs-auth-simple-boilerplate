import { ApiProperty } from '@nestjs/swagger';

export class SignInDTO {
  @ApiProperty({
    type: String,
    description: 'user email',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'user password',
  })
  password: string;
}
