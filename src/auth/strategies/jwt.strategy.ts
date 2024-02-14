import { ExtractJwt, Strategy } from 'passport-jwt';

import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { IAuthUser } from '../types/auth-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate({ id }: IAuthUser) {
    const user = await this.authService.validateUserById(id);
    if (!user) {
      throw new ForbiddenException('User not valid');
    }

    return user;
  }
}
