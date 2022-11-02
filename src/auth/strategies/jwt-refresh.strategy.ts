import { Injectable, ForbiddenException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IAuthUser, IAuthUserRefreshToken } from '../types/auth-user';
import { AuthService } from '../auth.service';

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
