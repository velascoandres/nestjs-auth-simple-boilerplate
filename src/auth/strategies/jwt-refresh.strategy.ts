import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IAuthUser } from '../types/auth-user';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { id }: IAuthUser): Promise<UserEntity> {
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { ...user, refreshToken };
  }
}
