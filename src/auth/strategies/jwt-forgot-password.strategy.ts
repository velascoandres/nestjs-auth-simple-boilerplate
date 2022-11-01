import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { EmailDTO } from '../dtos/email.dto';

@Injectable()
export class JwtForgotPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-forgot-password',
) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_FORGOT_PASSWORD_TOKEN_SECRET'),
    });
  }

  async validate({ email }: EmailDTO) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
