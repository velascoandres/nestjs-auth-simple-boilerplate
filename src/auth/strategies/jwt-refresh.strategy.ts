import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { IAuthUser, IAuthUserRefreshToken } from '../types/auth-user';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    { id }: IAuthUser,
  ): Promise<IAuthUserRefreshToken> {
    const user = await this.authService.validateUserById(id);
    if (!user) {
      throw new ForbiddenException('User not valid');
    }

    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { ...user, refreshToken };
  }
}
