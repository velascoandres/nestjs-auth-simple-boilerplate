import { ChangeEmailDTO } from './../dtos/change-email.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtChangeEmailStrategy extends PassportStrategy(
  Strategy,
  'jwt-change-email',
) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_CHANGE_EMAIL_TOKEN_SECRET'),
    });
  }

  async validate({ email, newEmail }: ChangeEmailDTO) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      ...user,
      newEmail,
    };
  }
}
